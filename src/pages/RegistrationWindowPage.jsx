import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { CalendarClock, ClipboardList, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const phaseStyle = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  disabled: 'bg-slate-100 text-slate-600 border-slate-200',
  closed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const phaseLabel = {
  live: 'Live',
  scheduled: 'Scheduled',
  disabled: 'Disabled',
  closed: 'Closed',
};

const formatIndia = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
};

const nowLocal = () => {
  const now = new Date();
  const pad = (part) => String(part).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const QUESTION_TYPES = [
  ['text', 'Short answer'],
  ['textarea', 'Long answer'],
  ['number', 'Number'],
  ['yesno', 'Yes or No'],
  ['select', 'Dropdown'],
  ['file', 'File upload'],
];

const toDraft = (data) => ({
  enabled: Boolean(data.enabled),
  liveFromInput: data.liveFromInput || '',
  disableAtInput: data.disableAtInput || '',
  registrationFee: data.registrationFee ?? 0,
  examCentresText: (data.examCentres || []).join('\n'),
  fields: data.fields || [],
  customFields: (data.customFields || []).map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type || 'text',
    optionsText: (field.options || []).join('\n'),
    required: Boolean(field.required),
    step: field.step === 2 ? 2 : 1,
  })),
});

const RegistrationWindowPage = () => {
  const [windowState, setWindowState] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyState = (data) => {
    setWindowState(data);
    setDraft(toDraft(data));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/registrations/window');
        applyState(response.data);
      } catch (error) {
        toast.error('Could not load the registration form settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateDraft = (name, value) => {
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const save = async (overrides, success) => {
    const next = { ...draft, ...overrides };
    if (next.liveFromInput && next.disableAtInput && next.disableAtInput <= next.liveFromInput) {
      toast.error('The disable date must be after the live date');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/registrations/window', {
        enabled: next.enabled,
        liveFrom: next.liveFromInput,
        disableAt: next.disableAtInput,
        registrationFee: next.registrationFee,
        examCentres: next.examCentresText.split('\n'),
      });
      applyState(response.data);
      toast.success(success);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update the registration form');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, patch) => {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.key === key ? { ...field, ...patch } : field)),
    }));
  };

  const updateQuestion = (id, patch) => {
    setDraft((current) => ({
      ...current,
      customFields: current.customFields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    }));
  };

  const addQuestion = () => {
    setDraft((current) => ({
      ...current,
      customFields: [
        ...current.customFields,
        { id: crypto.randomUUID(), label: '', type: 'text', optionsText: '', required: false, step: 1 },
      ],
    }));
  };

  const saveFields = async () => {
    const blank = draft.customFields.find((field) => !field.label.trim());
    if (blank) {
      toast.error('Every extra question needs a label');
      return;
    }
    const thinDropdown = draft.customFields.find((field) => (
      field.type === 'select' && field.optionsText.split('\n').map((line) => line.trim()).filter(Boolean).length < 2
    ));
    if (thinDropdown) {
      toast.error(`"${thinDropdown.label.trim()}" needs at least two dropdown choices`);
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/registrations/window', {
        fields: Object.fromEntries(draft.fields.filter((field) => !field.locked).map((field) => [field.key, {
          enabled: field.enabled,
          required: field.enabled && field.required,
        }])),
        customFields: draft.customFields.map((field) => ({
          id: field.id,
          label: field.label.trim(),
          type: field.type,
          required: field.required,
          step: Number(field.step) === 2 ? 2 : 1,
          options: field.type === 'select'
            ? field.optionsText.split('\n').map((line) => line.trim()).filter(Boolean)
            : [],
        })),
      });
      applyState(response.data);
      toast.success('Form fields saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save the form fields');
    } finally {
      setSaving(false);
    }
  };

  const setLiveNow = () => {
    const disableAtInput = draft.disableAtInput > nowLocal() ? draft.disableAtInput : '';
    save({ enabled: true, liveFromInput: '', disableAtInput }, 'The registration form is live');
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!draft || !windowState) {
    return <p className="text-sm text-slate-600">Could not load the registration form settings.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ClipboardList className="h-6 w-6 text-blue-600" /> Registration Form
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Choose which questions students see, then open the form, turn it off, or schedule the dates.
          </p>
        </div>
        <a href="/apply" target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600">
          Open student form
        </a>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${phaseStyle[windowState.phase] || phaseStyle.disabled}`}>
            {phaseLabel[windowState.phase] || 'Disabled'}
          </span>
          <p className="text-sm font-semibold text-slate-800">{windowState.message}</p>
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Goes live</dt>
            <dd className="font-semibold text-slate-800">{formatIndia(windowState.liveFrom)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Disables on</dt>
            <dd className="font-semibold text-slate-800">{formatIndia(windowState.disableAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Turn the form on or off</h3>
        <p className="text-xs leading-relaxed text-slate-500">
          Set live now opens the form immediately. A disable date that is still in the future will close it on that date.
          Disable now closes the form straight away, including when a future live date is saved.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={setLiveNow} disabled={saving} className="btn-primary">
            <Power className="h-4 w-4" /> Set live now
          </button>
          <button
            type="button"
            onClick={() => save({ enabled: false }, 'The registration form is disabled')}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <PowerOff className="h-4 w-4" /> Disable now
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CalendarClock className="h-4 w-4 text-blue-600" /> Schedule
        </h3>
        <p className="text-xs leading-relaxed text-slate-500">
          Choose a future date to open the form, and a later date to close it. Leave the live date empty to open it as soon as you save.
          Leave the disable date empty to keep it open until you turn it off. Saving the schedule turns the form on so these dates apply.
          Times use India time.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Make the form live from
            <input
              type="datetime-local"
              value={draft.liveFromInput}
              onChange={(event) => updateDraft('liveFromInput', event.target.value)}
              className="input-field mt-1"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Disable the form on
            <input
              type="datetime-local"
              value={draft.disableAtInput}
              onChange={(event) => updateDraft('disableAtInput', event.target.value)}
              className="input-field mt-1"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => save({ enabled: true }, 'The registration schedule is saved')}
          disabled={saving}
          className="btn-primary"
        >
          Save schedule
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Fee and exam centres</h3>
        <label className="block max-w-xs text-xs font-semibold text-slate-600">
          Registration fee (INR)
          <input
            type="number"
            min="0"
            step="1"
            value={draft.registrationFee}
            onChange={(event) => updateDraft('registrationFee', event.target.value)}
            className="input-field mt-1"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Exam centres, one per line
          <textarea
            rows="8"
            value={draft.examCentresText}
            onChange={(event) => updateDraft('examCentresText', event.target.value)}
            className="input-field mt-1 resize-y font-medium"
          />
        </label>
        <button
          type="button"
          onClick={() => save({}, 'Fee and exam centres saved')}
          disabled={saving}
          className="btn-primary"
        >
          Save fee and centres
        </button>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Fields on the form</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Untick a field to remove it. Tick Required when the student must answer it.
            First name, last name, mobile and email stay on so a student account can be created.
          </p>
        </div>
        {['Personal details', 'Education', 'Photo'].map((group) => (
          <div key={group} className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{group}</p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {draft.fields.filter((field) => field.group === group).map((field) => (
                <div key={field.key} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      disabled={field.locked || saving}
                      onChange={(event) => updateField(field.key, {
                        enabled: event.target.checked,
                        required: event.target.checked ? field.required : false,
                      })}
                    />
                    {field.label}
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={field.required}
                      disabled={field.locked || !field.enabled || saving}
                      onChange={(event) => updateField(field.key, { required: event.target.checked })}
                    />
                    Required
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Extra questions</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Add a question when you need something the form does not already ask. Remove it when you do not.
            </p>
          </div>
          {draft.customFields.map((field) => (
            <div key={field.id} className="space-y-3 rounded-xl border border-slate-200 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Question
                  <input
                    value={field.label}
                    onChange={(event) => updateQuestion(field.id, { label: event.target.value })}
                    className="input-field mt-1"
                    maxLength={80}
                    placeholder="For example, Aadhaar number"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Answer type
                  <select
                    value={field.type}
                    onChange={(event) => updateQuestion(field.id, { type: event.target.value })}
                    className="input-field mt-1"
                  >
                    {QUESTION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
              {field.type === 'file' && (
                <p className="text-xs text-slate-500">Students upload a PDF or image, up to 5 MB.</p>
              )}
              {field.type === 'select' && (
                <label className="block text-xs font-semibold text-slate-600">
                  Dropdown choices, one per line
                  <textarea
                    rows="3"
                    value={field.optionsText}
                    onChange={(event) => updateQuestion(field.id, { optionsText: event.target.value })}
                    className="input-field mt-1 resize-y"
                  />
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => updateQuestion(field.id, { required: event.target.checked })}
                    />
                    Required
                  </label>
                  <label className="flex items-center gap-2">
                    Show on
                    <select
                      value={field.step}
                      onChange={(event) => updateQuestion(field.id, { step: Number(event.target.value) })}
                      className="rounded-lg border border-slate-200 px-2 py-1"
                    >
                      <option value={1}>Personal details</option>
                      <option value={2}>Education</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft((current) => ({
                    ...current,
                    customFields: current.customFields.filter((item) => item.id !== field.id),
                  }))}
                  className="text-xs font-semibold text-rose-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} disabled={draft.customFields.length >= 15 || saving} className="text-sm font-semibold text-blue-600 disabled:opacity-50">
            Add a question
          </button>
        </div>

        <button type="button" onClick={saveFields} disabled={saving} className="btn-primary">
          Save fields
        </button>
      </section>
    </div>
  );
};

export default RegistrationWindowPage;
