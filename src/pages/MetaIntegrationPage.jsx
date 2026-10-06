import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Plug, Megaphone, CheckCircle2, AlertTriangle, RefreshCw, Unplug, ChevronLeft, ChevronRight, ChevronDown, Copy, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Public address of this CRM's API - Meta needs it for the login redirect and the webhook
const API_BASE_URL = new URL(api.defaults.baseURL, window.location.origin).toString().replace(/\/+$/, '');
const OAUTH_REDIRECT_URI = `${API_BASE_URL}/integrations/meta/callback`;

const copyValue = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success('Copied');
  } catch (error) {
    toast.error('Could not copy. Please select and copy the text manually.');
  }
};

// A value the admin has to paste into the Meta app, with a copy button
const CopyRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 break-all">{value}</code>
      <button
        type="button"
        onClick={() => copyValue(value)}
        className="px-2 py-1.5 bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 rounded font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer shrink-0"
      >
        <Copy className="w-3.5 h-3.5" /> Copy
      </button>
    </div>
  </div>
);

// Messages for the reason codes the backend sends back after Facebook Login
const OAUTH_ERRORS = {
  access_denied: 'Meta connection was cancelled. Nothing was changed.',
  invalid_state: 'The connection request expired or was invalid. Please try again.',
  missing_code: 'Meta did not return an authorization code. Please try again.',
  missing_permissions: 'Some required permissions were not granted. Please connect again and allow every requested permission.',
  no_pages: 'No Facebook Pages were found for this Meta account.',
  not_authorized: 'Your account is not allowed to connect Meta.',
  rate_limited: 'Meta rate limit reached. Please try again in a few minutes.',
  meta_api_error: 'Meta could not complete the connection. Please try again.',
  server_error: 'Something went wrong while connecting Meta. Please try again.',
};

const MetaIntegrationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('summary'); // summary | pages | forms

  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [selectedFormIds, setSelectedFormIds] = useState([]);

  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Meta app settings (App ID + App Secret) entered by the admin
  const [appForm, setAppForm] = useState({ appId: '', appSecret: '' });
  const [savingApp, setSavingApp] = useState(false);
  const [editingApp, setEditingApp] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Historical sync ("Sync Previous Leads")
  const [sync, setSync] = useState(null);
  const [startingSync, setStartingSync] = useState(false);
  const lastSyncStatus = useRef(null);
  const syncRunning = Boolean(sync) && ['pending', 'processing'].includes(sync.status);

  useEffect(() => {
    // Result of the Facebook Login redirect (?meta=connected | ?meta=error&reason=...)
    const params = new URLSearchParams(location.search);
    const result = params.get('meta');
    if (result === 'connected') {
      toast.success('Meta connected successfully', { id: 'meta-oauth-result' });
    } else if (result === 'error') {
      toast.error(OAUTH_ERRORS[params.get('reason')] || OAUTH_ERRORS.server_error, { id: 'meta-oauth-result', duration: 6000 });
    }
    if (result) {
      navigate(location.pathname, { replace: true });
    }

    fetchStatus();
    // Picks up a sync that is still running, e.g. after the browser was refreshed
    fetchSyncStatus();
  }, []);

  // Poll the progress while a sync is running
  useEffect(() => {
    if (!syncRunning) return undefined;
    const timer = setInterval(fetchSyncStatus, 2000);
    return () => clearInterval(timer);
  }, [syncRunning]);

  // silent: refresh the numbers without the full-page spinner or leaving the current step
  const fetchStatus = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/integrations/meta/status');
      setStatus(response.data);
      if (silent) return;

      // Connected but nothing selected yet: continue with Page selection
      if (response.data.connected && !response.data.selectedPage) {
        setStep('pages');
        fetchPages();
      } else {
        setStep('summary');
      }
    } catch (error) {
      toast.error('Failed to load Meta integration status');
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    setPagesLoading(true);
    try {
      const response = await api.get('/integrations/meta/pages');
      setPages(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load Facebook Pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const handleSaveApp = async (e) => {
    e.preventDefault();
    setSavingApp(true);
    try {
      await api.put('/integrations/meta/app-settings', {
        appId: appForm.appId.trim(),
        appSecret: appForm.appSecret.trim(),
        apiBaseUrl: API_BASE_URL,
        frontendRedirectUrl: window.location.origin + window.location.pathname,
      });
      toast.success('Meta app saved');
      setAppForm({ appId: '', appSecret: '' });
      setEditingApp(false);
      setShowSetup(true); // the webhook details are needed next
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save Meta app settings');
    } finally {
      setSavingApp(false);
    }
  };

  const handleEditApp = () => {
    setAppForm({ appId: status?.setup?.appId || '', appSecret: '' });
    setEditingApp(true);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await api.get('/integrations/meta/connect');
      // Continue on Facebook - Meta redirects back to this page afterwards
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start Meta connection');
      setConnecting(false);
    }
  };

  const handleChangeSelection = () => {
    setStep('pages');
    fetchPages();
  };

  const handleSelectPage = async (page) => {
    setActivePage(page);
    setForms([]);
    setSelectedFormIds([]);
    setStep('forms');
    setFormsLoading(true);
    try {
      const response = await api.get(`/integrations/meta/pages/${page.pageId}/forms`);
      setForms(response.data);
      setSelectedFormIds(response.data.filter((f) => f.selected).map((f) => f.formId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load lead forms');
      if (error.response?.data?.code === 'META_RECONNECT_REQUIRED') {
        fetchStatus();
      } else {
        setStep('pages');
      }
    } finally {
      setFormsLoading(false);
    }
  };

  const toggleForm = (formId) => {
    setSelectedFormIds((current) =>
      current.includes(formId) ? current.filter((id) => id !== formId) : [...current, formId]
    );
  };

  const handleConnectForms = async () => {
    setSaving(true);
    try {
      await api.post(`/integrations/meta/pages/${activePage.pageId}/forms`, { formIds: selectedFormIds });
      toast.success('Lead forms connected successfully');
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect lead forms');
      if (error.response?.data?.code === 'META_RECONNECT_REQUIRED') {
        fetchStatus();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Meta? New leads will stop arriving. Leads already collected are kept.')) return;

    setDisconnecting(true);
    try {
      await api.delete('/integrations/meta');
      toast.success('Meta disconnected');
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to disconnect Meta');
    } finally {
      setDisconnecting(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await api.get('/integrations/meta/sync/status');
      const next = response.data.sync;
      const wasRunning = ['pending', 'processing'].includes(lastSyncStatus.current);
      lastSyncStatus.current = next ? next.status : null;
      setSync(next);

      // The sync just finished: report the result and refresh the lead count
      if (next && wasRunning && ['completed', 'failed'].includes(next.status)) {
        if (next.status === 'completed') {
          toast.success(`Sync completed: ${next.leadsImported} lead(s) imported`, { id: 'meta-sync-result' });
        } else {
          toast.error(next.error || 'Lead sync failed', { id: 'meta-sync-result', duration: 6000 });
        }
        fetchStatus({ silent: true });
      }
    } catch (error) {
      // Keep the last known progress; the next poll tries again
    }
  };

  const handleStartSync = async () => {
    setStartingSync(true);
    try {
      const response = await api.post('/integrations/meta/sync');
      lastSyncStatus.current = response.data.sync.status;
      setSync(response.data.sync);
      if (response.data.alreadyRunning) {
        toast('A lead sync is already running', { id: 'meta-sync-result' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start the lead sync');
      if (error.response?.data?.code === 'META_RECONNECT_REQUIRED') {
        fetchStatus({ silent: true });
      }
    } finally {
      setStartingSync(false);
    }
  };

  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const response = await api.post('/integrations/meta/leads/retry-failed');
      toast.success(response.data.message);
      fetchStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry leads');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const connected = status?.connected;
  const setup = status?.setup || {};
  const appFromEnv = setup.source === 'env';
  // The admin enters the Meta app here unless it is fixed in the server environment
  const showAppForm = Boolean(status) && !appFromEnv && (!status.configured || editingApp);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Plug className="w-6 h-6 text-blue-600" /> Integrations
        </h2>
        <p className="text-xs text-slate-400 mt-1">Connect external lead sources to the CRM.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl shadow-sm space-y-5">
        {/* Card header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Meta Lead Ads</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-0.5">
                Automatically collect leads from Facebook Lead Ads.
              </p>
            </div>
          </div>
          {connected && (
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                status.needsReconnect ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {status.needsReconnect ? 'Reconnect required' : 'Connected'}
            </span>
          )}
        </div>

        {/* Meta app fixed in the server environment but incomplete */}
        {status && appFromEnv && !status.configured && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>The Meta app is set in the server environment but its settings are incomplete. Please contact your administrator.</span>
          </div>
        )}

        {/* One-time setup: the admin enters their own Meta app */}
        {showAppForm && (
          <form onSubmit={handleSaveApp} className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" /> {editingApp ? 'Change Meta app' : 'Step 1: Add your Meta app'}
              </p>
              <ol className="list-decimal pl-4 mt-2 space-y-1 text-xs text-slate-500 leading-relaxed">
                <li>
                  Open{' '}
                  <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">
                    developers.facebook.com/apps
                  </a>{' '}
                  and create an app (type: Business).
                </li>
                <li>In the app, add the <span className="font-semibold text-slate-700">Facebook Login</span> product and paste the redirect address below under "Valid OAuth Redirect URIs".</li>
                <li>Copy the App ID and App Secret from <span className="font-semibold text-slate-700">App settings &gt; Basic</span> into the fields below.</li>
              </ol>
            </div>

            <CopyRow label="Valid OAuth Redirect URI" value={OAUTH_REDIRECT_URI} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">App ID</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  value={appForm.appId}
                  onChange={(e) => setAppForm({ ...appForm, appId: e.target.value })}
                  placeholder="e.g. 1234567890123456"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">App Secret</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={appForm.appSecret}
                  onChange={(e) => setAppForm({ ...appForm, appSecret: e.target.value })}
                  placeholder="Paste the App Secret"
                  className="input-field"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              The App Secret is checked with Meta, stored encrypted and never shown again.
            </p>

            <div className="flex items-center justify-end gap-3">
              {editingApp && (
                <button
                  type="button"
                  onClick={() => setEditingApp(false)}
                  className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={savingApp} className="btn-primary px-4 py-2 disabled:opacity-60">
                {savingApp ? 'Checking with Meta...' : 'Save Meta App'}
              </button>
            </div>
          </form>
        )}

        {/* Not connected */}
        {status?.configured && !connected && !showAppForm && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Sign in with Facebook, choose your Page and the lead forms to collect. New leads then arrive in the CRM automatically.
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary disabled:opacity-60">
              <Plug className="w-4 h-4" /> {connecting ? 'Redirecting to Facebook...' : 'Connect Meta'}
            </button>
          </div>
        )}

        {/* Connected: reconnect notice */}
        {connected && status.needsReconnect && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1">Meta access has expired or was revoked. Reconnect Meta to keep receiving leads.</span>
            <button onClick={handleConnect} disabled={connecting} className="font-bold underline shrink-0 disabled:opacity-60">
              Reconnect
            </button>
          </div>
        )}

        {/* Connected: summary */}
        {connected && step === 'summary' && status.selectedPage && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Facebook Page</p>
              <p className="text-sm font-bold text-slate-900">{status.selectedPage.pageName || status.selectedPage.pageId}</p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Lead Forms</p>
              <div className="space-y-1">
                {status.forms.map((form) => (
                  <p key={form.formId} className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {form.formName || form.formId}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className={`text-xs font-bold ${status.receivingLeads ? 'text-emerald-700' : 'text-amber-700'}`}>
                {status.receivingLeads ? 'Receiving Leads' : 'Not receiving leads'}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {status.leadCounts.processed} lead(s) collected
                {status.lastLeadReceivedAt ? ` | Last lead ${new Date(status.lastLeadReceivedAt).toLocaleString()}` : ''}
                {status.leadCounts.pending > 0 ? ` | ${status.leadCounts.pending} being retrieved` : ''}
              </p>
              {!status.webhookConfigured && (
                <p className="text-[10px] text-amber-700 font-semibold mt-1">
                  The Meta webhook is not configured on the server, so new leads cannot be delivered yet.
                </p>
              )}
            </div>

            {/* Historical sync of leads submitted before the connection */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Previous leads</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                    Import leads that were submitted to these forms before now. Meta only keeps leads for 90 days after they are submitted, so older leads cannot be recovered.
                  </p>
                </div>
                <button
                  onClick={handleStartSync}
                  disabled={startingSync || syncRunning || status.needsReconnect}
                  className="btn-outline px-4 py-2 shrink-0 disabled:opacity-60 disabled:pointer-events-none"
                >
                  <RefreshCw className={`w-4 h-4 ${syncRunning ? 'animate-spin' : ''}`} /> {syncRunning ? 'Syncing...' : 'Sync Previous Leads'}
                </button>
              </div>

              {sync && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <p
                    className={`text-xs font-bold ${
                      syncRunning ? 'text-blue-600' : sync.status === 'failed' ? 'text-rose-700' : sync.formsFailed > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {syncRunning
                      ? sync.retryAt
                        ? 'Meta is busy. Waiting to retry...'
                        : 'Syncing previous leads...'
                      : sync.status === 'failed'
                        ? 'Sync failed'
                        : sync.formsFailed > 0
                          ? 'Completed with errors'
                          : 'Completed'}
                  </p>

                  {sync.forms.map((form) => (
                    <div key={form.formId} className="flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-700">{form.formName || form.formId}</p>
                        {form.error && <p className="text-[10px] text-rose-600 font-semibold mt-0.5">{form.error}</p>}
                      </div>
                      <span className={`shrink-0 font-semibold ${form.status === 'failed' ? 'text-rose-600' : 'text-slate-500'}`}>
                        {form.status === 'pending' ? 'Waiting' : form.status === 'failed' && form.leadsProcessed === 0 ? 'Failed' : `${form.leadsProcessed} processed`}
                      </span>
                    </div>
                  ))}

                  {!syncRunning && (
                    <div className="pt-2.5 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-800">
                        {sync.leadsImported} imported | {sync.duplicatesSkipped} duplicates skipped | {sync.failedLeads} failed
                      </p>
                      {sync.completedAt && (
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Last sync {new Date(sync.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {status.leadCounts.failed > 0 && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-800 font-semibold">
                  {status.leadCounts.failed} lead(s) could not be retrieved from Meta.
                </p>
                <button
                  onClick={handleRetryFailed}
                  disabled={retrying}
                  className="px-2 py-1 bg-rose-600/10 text-rose-700 hover:bg-rose-600/20 rounded font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-60"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <Link to="/dashboard/meta-leads" className="btn-primary px-4 py-2">
                View Leads <ChevronRight className="w-4 h-4" />
              </Link>
              <button onClick={handleChangeSelection} className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50">
                Change Page / Forms
              </button>
              <button onClick={handleConnect} disabled={connecting} className="btn-outline px-4 py-2 border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-60">
                <RefreshCw className="w-4 h-4" /> Reconnect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 disabled:opacity-60"
              >
                <Unplug className="w-4 h-4" /> Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Connected: choose a Facebook Page */}
        {connected && step === 'pages' && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Facebook Pages</p>
              {status.selectedPage && (
                <button onClick={() => setStep('summary')} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
            </div>

            {pagesLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : pages.length > 0 ? (
              pages.map((page) => (
                <div key={page.pageId} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{page.pageName || page.pageId}</p>
                    {page.selected && <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">Currently connected</p>}
                  </div>
                  <button onClick={() => handleSelectPage(page)} className="btn-outline px-4 py-2 shrink-0">
                    Select
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-semibold py-6 text-center">No Facebook Pages available. Reconnect Meta with an account that manages a Page.</p>
            )}

            {!status.selectedPage && (
              <div className="pt-3 flex items-center gap-3">
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 disabled:opacity-60"
                >
                  <Unplug className="w-4 h-4" /> Disconnect
                </button>
              </div>
            )}
          </div>
        )}

        {/* Connected: choose lead forms */}
        {connected && step === 'forms' && activePage && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Lead Forms: {activePage.pageName || activePage.pageId}
              </p>
              <button onClick={() => setStep('pages')} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {formsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : forms.length > 0 ? (
              <>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {forms.map((form) => (
                    <label key={form.formId} className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50/50">
                      <input
                        type="checkbox"
                        checked={selectedFormIds.includes(form.formId)}
                        onChange={() => toggleForm(form.formId)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-slate-800">{form.formName || form.formId}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-end">
                  <button
                    onClick={handleConnectForms}
                    disabled={saving || selectedFormIds.length === 0}
                    className="btn-primary px-4 py-2 disabled:opacity-60"
                  >
                    {saving ? 'Connecting...' : 'Connect Selected'}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 font-semibold py-6 text-center">This Page has no active lead forms.</p>
            )}
          </div>
        )}

        {/* Meta app details: values to paste into the Meta app, incl. the webhook that delivers the leads */}
        {status?.configured && !showAppForm && (
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-blue-600"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Meta app &amp; webhook settings
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSetup ? 'rotate-180' : ''}`} />
            </button>

            {showSetup && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  For leads to arrive, open your Meta app, add the <span className="font-semibold text-slate-700">Webhooks</span> product, choose{' '}
                  <span className="font-semibold text-slate-700">Page</span>, enter the callback URL and verify token below, then subscribe to the{' '}
                  <span className="font-semibold text-slate-700">leadgen</span> field.
                </p>

                {setup.webhookCallbackUrl && <CopyRow label="Webhook Callback URL" value={setup.webhookCallbackUrl} />}
                {setup.webhookVerifyToken ? (
                  <CopyRow label="Webhook Verify Token" value={setup.webhookVerifyToken} />
                ) : (
                  <p className="text-[10px] text-slate-400 font-semibold">The webhook verify token is set in the server environment.</p>
                )}
                {setup.redirectUri && <CopyRow label="Valid OAuth Redirect URI" value={setup.redirectUri} />}

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500 font-semibold">App ID: {setup.appId}</p>
                  {!appFromEnv && (
                    <button onClick={handleEditApp} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 underline">
                      Change App ID / Secret
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaIntegrationPage;
