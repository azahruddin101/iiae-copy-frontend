import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LogoImage from '../assets/Logo.png';

const MONTHS = [
  ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'],
  ['5', 'May'], ['6', 'June'], ['7', 'July'], ['8', 'August'],
  ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];

const blankRecord = () => ({ board: '', passingYear: '', school: '', stream: '', percentage: '' });

const EDUCATION_SECTIONS = {
  classX: {
    title: 'Class X Details',
    board: 'Class X Board',
    boardPlaceholder: 'Board Name',
    school: 'Class X School',
    schoolPlaceholder: 'School name and address',
  },
  classXII: {
    title: 'Class XII Details',
    board: 'Class XII Board',
    boardPlaceholder: 'Board Name',
    school: 'Class XII School',
    schoolPlaceholder: 'School name and address',
    stream: 'Stream',
    streamPlaceholder: 'Science, Commerce or Arts',
  },
  diploma: {
    title: 'Diploma Details',
    board: 'Institute',
    boardPlaceholder: 'Institute name',
    school: 'Institute Address',
    schoolPlaceholder: 'Institute address',
    stream: 'Specialization',
    streamPlaceholder: 'Specialization',
  },
  iti: {
    title: 'ITI Details',
    board: 'Institute',
    boardPlaceholder: 'Institute name',
    school: 'Institute Address',
    schoolPlaceholder: 'Institute address',
    stream: 'Trade',
    streamPlaceholder: 'Trade',
  },
  graduation: {
    title: 'Graduation Details',
    board: 'University',
    boardPlaceholder: 'University name',
    school: 'College',
    schoolPlaceholder: 'College name and address',
    stream: 'Degree',
    streamPlaceholder: 'Degree',
  },
  postGraduation: {
    title: 'Post Graduation Details',
    board: 'University',
    boardPlaceholder: 'University name',
    school: 'College',
    schoolPlaceholder: 'College name and address',
    stream: 'Degree',
    streamPlaceholder: 'Degree',
  },
};

const LEVELS_FOR = {
  '10th': ['classX'],
  '12th': ['classX', 'classXII'],
  Diploma: ['classX', 'diploma'],
  ITI: ['classX', 'iti'],
  Graduate: ['classX', 'classXII', 'graduation'],
  'Post Graduate': ['classX', 'classXII', 'graduation', 'postGraduation'],
};

const emptyForm = {
  firstName: '',
  lastName: '',
  gender: '',
  dobDay: '',
  dobMonth: '',
  dobYear: '',
  category: '',
  fatherName: '',
  motherName: '',
  mobile: '',
  parentMobile: '',
  email: '',
  parentEmail: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pin: '',
  courseId: '',
  qualification: '',
  academics: {
    classX: blankRecord(),
    classXII: blankRecord(),
    diploma: blankRecord(),
    iti: blankRecord(),
    graduation: blankRecord(),
    postGraduation: blankRecord(),
  },
  examCentreFirst: '',
  examCentreSecond: '',
  extra: {},
};

const control = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 57 }, (_, index) => String(currentYear - 14 - index));
const passingYears = Array.from({ length: currentYear - 1970 + 1 }, (_, index) => String(currentYear - index));

const buildDob = (day, month, year) => {
  if (!day || !month || !year) return '';
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const valid = date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);
  if (!valid) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const Field = ({ label, required, hint, children }) => (
  <label className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center sm:gap-4">
    <span className="text-sm font-semibold text-slate-800">
      {label} {required && <span className="text-rose-600">*</span>}
      {hint && <span className="mt-0.5 block text-[11px] font-medium text-slate-400">{hint}</span>}
    </span>
    {children}
  </label>
);

const EducationBlock = ({ spec, value, onChange, years }) => (
  <div className="space-y-4">
    <h3 className="pt-2 text-base font-bold text-slate-900">{spec.title}</h3>
    <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
      <Field label={spec.board} required>
        <input value={value.board} onChange={onChange('board')} placeholder={spec.boardPlaceholder} className={control} />
      </Field>
      <Field label="Passing Year" required>
        <Select value={value.passingYear} onChange={onChange('passingYear')} placeholder="Select Passing Year">
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </Select>
      </Field>
      <Field label={spec.school} required>
        <textarea rows="2" value={value.school} onChange={onChange('school')} placeholder={spec.schoolPlaceholder} className={`${control} resize-none`} />
      </Field>
      {spec.stream ? (
        <Field label={spec.stream} required>
          <input value={value.stream} onChange={onChange('stream')} placeholder={spec.streamPlaceholder} className={control} />
        </Field>
      ) : (
        <Field label="Percentage">
          <input type="number" min="0" max="100" step="0.01" value={value.percentage} onChange={onChange('percentage')} placeholder="Percentage" className={control} />
        </Field>
      )}
      {spec.stream && (
        <Field label="Percentage">
          <input type="number" min="0" max="100" step="0.01" value={value.percentage} onChange={onChange('percentage')} placeholder="Percentage" className={control} />
        </Field>
      )}
    </div>
  </div>
);

const ExtraFields = ({ fields, values, files, onChange, onFile }) => {
  if (!fields.length) return null;
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
      {fields.map((field) => (
        <Field key={field.id} label={field.label} required={field.required}>
          {field.type === 'file' ? (
            <div>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={onFile(field.id)}
                className="text-sm text-slate-600"
              />
              <span className="mt-1 block text-[11px] font-medium text-slate-400">PDF, JPG, PNG, or WEBP. Maximum size 5 MB.</span>
              {files?.[field.id]?.name && <span className="mt-1 block text-xs font-semibold text-slate-700">{files[field.id].name}</span>}
            </div>
          ) : field.type === 'textarea' ? (
            <textarea rows="3" value={values[field.id] || ''} onChange={onChange(field.id)} className={`${control} resize-none`} />
          ) : field.type === 'yesno' || field.type === 'select' ? (
            <Select value={values[field.id] || ''} onChange={onChange(field.id)} placeholder="Select">
              {(field.type === 'yesno' ? ['Yes', 'No'] : field.options || []).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={values[field.id] || ''}
              onChange={onChange(field.id)}
              className={control}
            />
          )}
        </Field>
      ))}
    </div>
  );
};

const Select = ({ value, onChange, placeholder, children }) => (
  <select value={value} onChange={onChange} className={control}>
    <option value="">{placeholder}</option>
    {children}
  </select>
);

const asked = (windowState, key) => {
  const field = (windowState?.fields || []).find((item) => item.key === key);
  return field ? field.enabled : true;
};

const must = (windowState, key) => {
  const field = (windowState?.fields || []).find((item) => item.key === key);
  if (!field) return key !== 'parentEmail';
  return field.enabled && field.required;
};

const visibleStepsFor = (windowState) => {
  const extras = windowState?.customFields || [];
  const education = (asked(windowState, 'course') && (windowState?.courses || []).length > 0)
    || asked(windowState, 'qualification')
    || asked(windowState, 'examCentres')
    || extras.some((field) => field.step === 2);
  const steps = [{ id: 1, label: 'Personal Details' }];
  if (education) steps.push({ id: 2, label: 'Educational Details' });
  if (asked(windowState, 'photo')) steps.push({ id: 3, label: 'Photo Upload' });
  steps.push({ id: 4, label: 'Payment' });
  return steps;
};

const Stepper = ({ step, steps }) => (
  <ol className="relative mx-auto grid max-w-3xl px-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
    <span className="absolute left-[12%] right-[12%] top-4 h-px bg-slate-300" />
    {steps.map((item, index) => {
      const active = item.id === step;
      return (
        <li key={item.id} className="flex flex-col items-center gap-2 text-center">
          <span className={`z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
            active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {index + 1}
          </span>
          <span className={`px-1 text-[10px] font-bold uppercase tracking-wide ${
            active ? 'text-slate-900' : 'text-slate-400'
          }`}>
            {item.label}
          </span>
        </li>
      );
    })}
  </ol>
);

const ApplyPage = () => {
  const { token } = useParams();
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [windowState, setWindowState] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [extraFiles, setExtraFiles] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(token ? `${apiBase}/registrations/form/${token}` : `${apiBase}/registrations/window`);
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) {
          setMissing(true);
          return;
        }
        if (!response.ok) {
          setLoadError(data.message || 'Could not load the form');
          return;
        }
        setWindowState(data);
        if (data.submitted) {
          setSubmitted(true);
          return;
        }
        if (data.lead) {
          setForm((current) => ({
            ...current,
            firstName: data.lead.firstName || '',
            lastName: data.lead.lastName || '',
            email: data.lead.email || '',
            mobile: data.lead.mobile || '',
            courseId: data.lead.courseId || '',
          }));
        }
      } catch (loadError) {
        setLoadError('Could not load the form. Check that the server is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase, token]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const centres = windowState?.examCentres || [];
  const courses = windowState?.courses || [];
  const courseName = courses.find((course) => course._id === form.courseId)?.name || '';

  const set = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
    setError('');
  };

  const setExtra = (id) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, extra: { ...current.extra, [id]: value } }));
    setError('');
  };

  const setExtraFile = (id) => (event) => {
    const file = event.target.files?.[0] || null;
    setExtraFiles((current) => ({ ...current, [id]: file }));
    setError('');
  };

  const setAcademic = (level, field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      academics: {
        ...current.academics,
        [level]: { ...current.academics[level], [field]: value },
      },
    }));
    setError('');
  };

  const feeLabel = useMemo(() => {
    const fee = Number(windowState?.registrationFee) || 0;
    return fee > 0 ? rupee.format(fee) : '';
  }, [windowState]);

  const steps = useMemo(() => visibleStepsFor(windowState), [windowState]);
  const on = (key) => asked(windowState, key);
  const required = (key) => must(windowState, key);
  const extrasFor = (stepId) => (windowState?.customFields || []).filter((field) => field.step === stepId);

  const checkExtra = (stepId) => {
    for (const field of extrasFor(stepId)) {
      if (field.type === 'file') {
        const file = extraFiles[field.id];
        if (field.required && !file) return `Upload ${field.label}`;
        if (file && !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          return `${field.label} must be a PDF, JPG, PNG, or WEBP file`;
        }
        if (file && file.size > 5 * 1024 * 1024) return `${field.label} must be 5 MB or smaller`;
        continue;
      }
      const value = String(form.extra?.[field.id] || '').trim();
      if (field.required && !value) return `${field.label} is required`;
      if (!value) continue;
      if (field.type === 'number' && !Number.isFinite(Number(value))) return `${field.label} must be a number`;
      if (field.type === 'select' && !(field.options || []).includes(value)) return `Select ${field.label}`;
      if (field.type === 'yesno' && value !== 'Yes' && value !== 'No') return `Select ${field.label}`;
    }
    return '';
  };

  const filled = (key, value) => required(key) && !String(value || '').trim();

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) return 'Enter the first and last name';
      if (on('gender') && required('gender') && !form.gender) return 'Select a gender';
      if (on('dob')) {
        const dob = buildDob(form.dobDay, form.dobMonth, form.dobYear);
        const started = form.dobDay || form.dobMonth || form.dobYear;
        if (required('dob') && !dob) return 'Select a valid date of birth';
        if (started && !dob) return 'Select a valid date of birth';
      }
      if (on('category') && required('category') && !form.category) return 'Select a category';
      if (filled('fatherName', form.fatherName)) return "Father's name is required";
      if (filled('motherName', form.motherName)) return "Mother's name is required";
      if (!/^[0-9]{10}$/.test(form.mobile.trim())) return 'Mobile must be a 10 digit number';
      if (on('parentMobile') && (required('parentMobile') || form.parentMobile.trim()) && !/^[0-9]{10}$/.test(form.parentMobile.trim())) {
        return "Parent's mobile must be a 10 digit number";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid student email';
      if (on('parentEmail') && (required('parentEmail') || form.parentEmail.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim())) {
        return 'Enter a valid parent email';
      }
      if (filled('address', form.address) || filled('city', form.city) || filled('state', form.state) || filled('country', form.country)) {
        return 'Enter the address, city, state and country';
      }
      if (on('pin') && (required('pin') || form.pin.trim()) && !/^[0-9]{6}$/.test(form.pin.trim())) {
        return 'Pin must be a 6 digit number';
      }
      const extraProblem = checkExtra(1);
      if (extraProblem) return extraProblem;
    }

    if (currentStep === 2) {
      if (on('course') && courses.length > 0 && required('course') && !form.courseId) return 'Select a course';
      if (on('qualification') && required('qualification') && !form.qualification) return 'Select a qualification';
      if (on('qualification') && form.qualification) {
        const levels = LEVELS_FOR[form.qualification] || [];
        for (const level of levels) {
          const spec = EDUCATION_SECTIONS[level];
          const record = form.academics[level];
          if (!record.board.trim() || !record.passingYear || !record.school.trim() || (spec.stream && !record.stream.trim())) {
            return `Complete the ${spec.title.toLowerCase()}`;
          }
          if (record.percentage !== '' && (Number(record.percentage) < 0 || Number(record.percentage) > 100)) {
            return `${spec.title} percentage must be between 0 and 100`;
          }
        }
      }
      if (on('examCentres')) {
        const either = form.examCentreFirst || form.examCentreSecond;
        if ((required('examCentres') || either) && (!form.examCentreFirst || !form.examCentreSecond)) {
          return 'Select both exam centres';
        }
        if (form.examCentreFirst && form.examCentreFirst === form.examCentreSecond) return 'Choose two different exam centres';
      }
      const extraProblem = checkExtra(2);
      if (extraProblem) return extraProblem;
    }

    if (currentStep === 3 && on('photo')) {
      if (required('photo') && !photo) return 'Upload a photograph to continue';
      if (photo && !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) return 'Photo must be a JPG, PNG, or WEBP image';
      if (photo && photo.size > 2 * 1024 * 1024) return 'Photo must be 2 MB or smaller';
    }

    return '';
  };

  const goNext = () => {
    const problem = validateStep(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    const index = steps.findIndex((item) => item.id === step);
    const next = steps[index + 1];
    if (next) setStep(next.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setError('');
    const index = steps.findIndex((item) => item.id === step);
    const previous = steps[Math.max(0, index - 1)];
    if (previous) setStep(previous.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0] || null;
    setPhoto(file);
    setError('');
  };

  const handleSubmit = async () => {
    const problem = [1, 2, 3].map(validateStep).find(Boolean);
    if (problem) {
      setError(problem);
      return;
    }

    const dob = buildDob(form.dobDay, form.dobMonth, form.dobYear);
    const payload = new FormData();
    payload.append('firstName', form.firstName.trim());
    payload.append('lastName', form.lastName.trim());
    if (on('gender')) payload.append('gender', form.gender);
    if (on('dob') && dob) payload.append('dob', dob);
    if (on('category')) payload.append('category', form.category);
    if (on('fatherName')) payload.append('fatherName', form.fatherName.trim());
    if (on('motherName')) payload.append('motherName', form.motherName.trim());
    payload.append('mobile', form.mobile.trim());
    if (on('parentMobile')) payload.append('parentMobile', form.parentMobile.trim());
    payload.append('email', form.email.trim());
    if (on('parentEmail')) payload.append('parentEmail', form.parentEmail.trim());
    if (on('address')) payload.append('address', form.address.trim());
    if (on('city')) payload.append('city', form.city.trim());
    if (on('state')) payload.append('state', form.state.trim());
    if (on('country')) payload.append('country', form.country.trim());
    if (on('pin')) payload.append('pin', form.pin.trim());
    if (on('course')) payload.append('courseId', form.courseId);
    const academics = {};
    if (on('qualification')) {
      (LEVELS_FOR[form.qualification] || []).forEach((level) => {
        academics[level] = form.academics[level];
      });
      payload.append('qualification', form.qualification);
      payload.append('academics', JSON.stringify(academics));
    }
    if (on('examCentres')) {
      payload.append('examCentreFirst', form.examCentreFirst);
      payload.append('examCentreSecond', form.examCentreSecond);
    }
    payload.append('extraAnswers', JSON.stringify(
      (windowState.customFields || []).filter((field) => field.type !== 'file').map((field) => ({
        id: field.id,
        value: String(form.extra?.[field.id] || '').trim(),
      }))
    ));
    (windowState.customFields || []).forEach((field) => {
      if (field.type === 'file' && extraFiles[field.id]) {
        payload.append(`extraFile_${field.id}`, extraFiles[field.id]);
      }
    });
    if (on('photo') && photo) payload.append('photo', photo);

    setSaving(true);
    setError('');
    try {
      const response = await fetch(token ? `${apiBase}/registrations/form/${token}` : `${apiBase}/registrations/apply`, {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.step) setStep(data.step);
        setError(data.message || 'Could not submit the form');
        return;
      }
      setCredentials({ email: data.email, temporaryPassword: data.temporaryPassword });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submitError) {
      setError('Could not submit the form');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <img src={LogoImage} alt="Innovbit" className="h-12 w-12 object-contain" />
          <div>
            <p className="text-sm font-bold text-slate-900">Innovbit New Delhi</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">Student registration</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading && <p className="text-sm text-slate-500">Loading the form...</p>}

        {!loading && missing && (
          <p className="text-sm text-slate-600">This registration link is not valid. Ask the counsellor for a new link.</p>
        )}

        {!loading && !missing && loadError && (
          <p className="text-sm text-slate-600">{loadError}</p>
        )}

        {!loading && !missing && !loadError && submitted && (
          <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 p-6">
            <h1 className="text-xl font-bold text-slate-900">Application submitted</h1>
            <p className="text-sm text-slate-600">
              The registration fee stays unpaid until the institute confirms the payment.
            </p>
            {credentials && (
              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-bold text-slate-900">Student login</p>
                <p>Email: {credentials.email}</p>
                <p>Temporary password: {credentials.temporaryPassword}</p>
                <p className="text-xs text-slate-500">Save this password. It is shown only once.</p>
              </div>
            )}
            <Link to="/login" className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Go to login
            </Link>
          </section>
        )}

        {!loading && !missing && !loadError && !submitted && windowState && !windowState.open && (
          <section className="mx-auto max-w-xl space-y-3 rounded-2xl border border-slate-200 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {windowState.phase === 'scheduled' ? 'Opens later' : 'Registration closed'}
            </p>
            <h1 className="text-xl font-bold text-slate-900">{windowState.message}</h1>
            <p className="text-sm text-slate-600">
              The form accepts new students only while it is live. Come back when registration is open.
            </p>
          </section>
        )}

        {!loading && !missing && !loadError && !submitted && windowState?.open && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Innovbit Student Registration</h1>
              <p className="text-sm text-slate-500">Complete each step. The application is saved when you submit.</p>
            </div>

            <Stepper step={step} steps={steps} />

            <section className="space-y-6">
              {step === 1 && (
                <>
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-lg font-bold text-slate-900">Student&apos;s Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
                    <Field label="First Name" required>
                      <input value={form.firstName} onChange={set('firstName')} className={control} />
                    </Field>
                    <Field label="Last Name" required>
                      <input value={form.lastName} onChange={set('lastName')} className={control} />
                    </Field>
                    {on('gender') && (
                      <Field label="Gender" required={required('gender')}>
                        <Select value={form.gender} onChange={set('gender')} placeholder="Select Gender">
                          {(windowState.genders || []).map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                        </Select>
                      </Field>
                    )}
                    {on('dob') && (
                      <Field label="DOB" required={required('dob')}>
                        <div className="grid grid-cols-3 gap-2">
                          <Select value={form.dobDay} onChange={set('dobDay')} placeholder="Day">
                            {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </Select>
                          <Select value={form.dobMonth} onChange={set('dobMonth')} placeholder="Month">
                            {MONTHS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </Select>
                          <Select value={form.dobYear} onChange={set('dobYear')} placeholder="Year">
                            {birthYears.map((year) => <option key={year} value={year}>{year}</option>)}
                          </Select>
                        </div>
                      </Field>
                    )}
                    {on('category') && (
                      <Field label="Category" required={required('category')}>
                        <Select value={form.category} onChange={set('category')} placeholder="Select Category">
                          {(windowState.categories || []).map((category) => <option key={category} value={category}>{category}</option>)}
                        </Select>
                      </Field>
                    )}
                    {on('fatherName') && (
                      <Field label="Father's Name" required={required('fatherName')}>
                        <input value={form.fatherName} onChange={set('fatherName')} className={control} />
                      </Field>
                    )}
                    {on('motherName') && (
                      <Field label="Mother's Name" required={required('motherName')}>
                        <input value={form.motherName} onChange={set('motherName')} className={control} />
                      </Field>
                    )}
                    <Field label="Mobile" required>
                      <input inputMode="numeric" maxLength={10} value={form.mobile} onChange={set('mobile')} className={control} />
                    </Field>
                    {on('parentMobile') && (
                      <Field label="Parent's Mobile" required={required('parentMobile')}>
                        <input inputMode="numeric" maxLength={10} value={form.parentMobile} onChange={set('parentMobile')} className={control} />
                      </Field>
                    )}
                    <Field label="Student Email Id" required>
                      <input type="email" value={form.email} onChange={set('email')} className={control} />
                    </Field>
                    {on('parentEmail') && (
                      <Field label="Parent's Email Id" required={required('parentEmail')} hint={required('parentEmail') ? '' : 'Optional'}>
                        <input type="email" value={form.parentEmail} onChange={set('parentEmail')} className={control} />
                      </Field>
                    )}
                    {on('address') && (
                      <Field label="Address" required={required('address')}>
                        <textarea rows="2" value={form.address} onChange={set('address')} className={`${control} resize-none`} />
                      </Field>
                    )}
                    {on('city') && (
                      <Field label="City" required={required('city')}>
                        <input value={form.city} onChange={set('city')} className={control} />
                      </Field>
                    )}
                    {on('state') && (
                      <Field label="State" required={required('state')}>
                        <input value={form.state} onChange={set('state')} className={control} />
                      </Field>
                    )}
                    {on('country') && (
                      <Field label="Country" required={required('country')}>
                        <input value={form.country} onChange={set('country')} className={control} />
                      </Field>
                    )}
                    {on('pin') && (
                      <Field label="Pin" required={required('pin')}>
                        <input inputMode="numeric" maxLength={6} value={form.pin} onChange={set('pin')} className={control} />
                      </Field>
                    )}
                  </div>
                  <ExtraFields fields={extrasFor(1)} values={form.extra} files={extraFiles} onChange={setExtra} onFile={setExtraFile} />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-lg font-bold text-slate-900">Educational Details</h2>
                  </div>
                  {on('course') && courses.length > 0 && (
                    <div className="max-w-xl">
                      <Field label="Course" required={required('course')}>
                        <Select value={form.courseId} onChange={set('courseId')} placeholder="Select a course">
                          {courses.map((course) => (
                            <option key={course._id} value={course._id}>{course.name}</option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  )}
                  {on('qualification') && (
                    <div className="max-w-xl pt-2">
                      <Field label="Qualification" required={required('qualification')}>
                        <Select value={form.qualification} onChange={set('qualification')} placeholder="Please select your qualification">
                          {(windowState.qualifications || []).map((item) => <option key={item} value={item}>{item}</option>)}
                        </Select>
                      </Field>
                    </div>
                  )}

                  {on('qualification') && (LEVELS_FOR[form.qualification] || []).map((level) => (
                    <EducationBlock
                      key={level}
                      spec={EDUCATION_SECTIONS[level]}
                      value={form.academics[level]}
                      years={passingYears}
                      onChange={(field) => setAcademic(level, field)}
                    />
                  ))}
                  {on('qualification') && !form.qualification && (
                    <p className="text-sm text-slate-500">Select a qualification to enter the matching education details.</p>
                  )}

                  {on('examCentres') && (
                    <>
                      <h3 className="pt-2 text-base font-bold text-slate-900">Choose Exam Centre</h3>
                      <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
                        <Field label="1st Choice" required={required('examCentres')}>
                          <Select value={form.examCentreFirst} onChange={set('examCentreFirst')} placeholder="Select Exam Centre">
                            {centres.map((centre) => <option key={centre} value={centre}>{centre}</option>)}
                          </Select>
                        </Field>
                        <Field label="2nd Choice" required={required('examCentres')}>
                          <Select value={form.examCentreSecond} onChange={set('examCentreSecond')} placeholder="Select Exam Centre">
                            {centres.map((centre) => <option key={centre} value={centre}>{centre}</option>)}
                          </Select>
                        </Field>
                      </div>
                    </>
                  )}
                  <ExtraFields fields={extrasFor(2)} values={form.extra} files={extraFiles} onChange={setExtra} onFile={setExtraFile} />
                </>
              )}

              {step === 3 && (
                <>
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-lg font-bold text-slate-900">Candidate&apos;s Photograph</h2>
                  </div>
                  <Field label="Photo" required={required('photo')}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="text-sm text-slate-600" />
                  </Field>
                  <p className="text-xs text-slate-500">JPG, PNG, or WEBP. Maximum size 2 MB.</p>
                  {photoPreview && (
                    <img src={photoPreview} alt="Selected photograph" className="h-36 w-28 rounded-md border border-slate-200 object-cover" />
                  )}
                </>
              )}

              {step === 4 && (
                <>
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-lg font-bold text-slate-900">Payment</h2>
                  </div>
                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Student</p>
                      <p className="text-sm font-semibold text-slate-900">{form.firstName} {form.lastName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Email</p>
                      <p className="text-sm font-semibold text-slate-900">{form.email}</p>
                    </div>
                    {on('course') && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Course</p>
                        <p className="text-sm font-semibold text-slate-900">{courseName || 'Not selected'}</p>
                      </div>
                    )}
                    {on('examCentres') && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Exam centres</p>
                        <p className="text-sm font-semibold text-slate-900">{form.examCentreFirst || '—'} / {form.examCentreSecond || '—'}</p>
                      </div>
                    )}
                    {(windowState.customFields || []).filter((field) => (
                      field.type === 'file' ? extraFiles[field.id] : String(form.extra?.[field.id] || '').trim()
                    )).map((field) => (
                      <div key={field.id}>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {field.type === 'file' ? extraFiles[field.id].name : form.extra[field.id]}
                        </p>
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Registration fee</p>
                      <p className="text-lg font-bold text-slate-900">{feeLabel || 'No fee'}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {feeLabel
                          ? 'Submit the application now. It stays unpaid until the institute marks this fee as paid.'
                          : 'No registration fee is set. Submit the application and the institute will confirm it.'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

              <div className="flex gap-3">
                {step > 1 && (
                  <button type="button" onClick={goBack} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Back
                  </button>
                )}
                {steps[steps.length - 1]?.id !== step ? (
                  <button type="button" onClick={goNext} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Save & Continue
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    {saving ? 'Submitting...' : 'Submit application'}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplyPage;
