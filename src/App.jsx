import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

const stages = [
  {
    icon: '🌱',
    name: 'المرحلة الابتدائية',
    grades: [
      'الصف الأول الابتدائي',
      'الصف الثاني الابتدائي',
      'الصف الثالث الابتدائي',
      'الصف الرابع الابتدائي',
      'الصف الخامس الابتدائي',
      'الصف السادس الابتدائي'
    ],
    subjects: [
      'اللغة العربية',
      'اللغة الإنجليزية',
      'الرياضيات',
      'العلوم',
      'الدراسات الاجتماعية',
      'تكنولوجيا المعلومات'
    ]
  },
  {
    icon: '📚',
    name: 'المرحلة الإعدادية',
    grades: [
      'الصف الأول الإعدادي',
      'الصف الثاني الإعدادي',
      'الصف الثالث الإعدادي'
    ],
    subjects: [
      'اللغة العربية',
      'اللغة الإنجليزية',
      'الرياضيات',
      'العلوم',
      'الدراسات الاجتماعية',
      'اللغة الفرنسية'
    ]
  },
  {
    icon: '🎓',
    name: 'المرحلة الثانوية',
    grades: [
      'الصف الأول الثانوي',
      'الصف الثاني الثانوي',
      'الصف الثالث الثانوي'
    ],
    subjects: [
      'اللغة العربية',
      'اللغة الإنجليزية',
      'الرياضيات',
      'الفيزياء',
      'الكيمياء',
      'الأحياء',
      'التاريخ',
      'الجغرافيا',
      'الفلسفة والمنطق'
    ]
  }
];

function App() {
  const [view, setView] = useState('student');
  const [adminTab, setAdminTab] = useState('dashboard');

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // login | signup
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentForm, setStudentForm] = useState({ fullName: '', phone: '', email: '', password: '' });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

const [enrollments, setEnrollments] = useState([]);
const [studentProfiles, setStudentProfiles] = useState([]);
const [enrollmentSearch, setEnrollmentSearch] = useState('');
const [enrollmentFilter, setEnrollmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbError, setDbError] = useState('');
  const [notice, setNotice] = useState('');

  const [stageFilter, setStageFilter] = useState('الكل');
  const [gradeFilter, setGradeFilter] = useState('الكل');
  const [subjectFilter, setSubjectFilter] = useState('الكل');
  const [search, setSearch] = useState('');

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    subject: '',
    stage: '',
    grades: [],
    bio: '',
    phone: '',
    image: ''
  });

  const [courseForm, setCourseForm] = useState({
    title: '',
    teacherId: '',
    stage: '',
    grade: '',
    subject: '',
    price: '',
    description: '',
    type: 'مسجل'
  });

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  // تحويل بيانات المدرسين
  const normalizeTeacher = (teacher) => ({
    ...teacher,
    image: teacher.image_url || '',
    grades: Array.isArray(teacher.grades)
      ? teacher.grades
      : [],
    bio: teacher.bio || '',
    phone: teacher.phone || ''
  });

  // تحويل بيانات الكورسات
  const normalizeCourse = (course) => ({
    ...course,
    teacherId: course.teacher_id,
    price: String(course.price ?? 0),
    description: course.description || '',
    type: course.type || 'مسجل'
  });

  // تحميل البيانات من Supabase
  const loadAfaqData = async () => {
    setLoading(true);
    setDbError('');

    try {
      const [teachersResult, coursesResult] =
        await Promise.all([
          supabase.from('teachers').select('*').order('id'),
          supabase.from('courses').select('*').order('id')
        ]);

      if (teachersResult.error) {
        throw teachersResult.error;
      }

      if (coursesResult.error) {
        throw coursesResult.error;
      }

      setTeachers(
        (teachersResult.data || []).map(normalizeTeacher)
      );

      setCourses(
        (coursesResult.data || []).map(normalizeCourse)
      );
      const { data: { session } } =
  await supabase.auth.getSession();

const user = session?.user ?? null;

if (user) {
  const { data: adminStatus, error: adminError } =
    await supabase.rpc('is_afaq_admin');

  if (adminError) throw adminError;

  let enrollmentQuery = supabase
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false });

  if (!adminStatus) {
    enrollmentQuery = enrollmentQuery.eq(
      'student_id',
      user.id
    );
  }

  const { data: enrollmentsData, error: enrollmentsError } =
    await enrollmentQuery;

  if (enrollmentsError) throw enrollmentsError;

  setEnrollments(enrollmentsData || []);

  if (adminStatus) {
    const { data: profilesData, error: profilesError } =
      await supabase
        .from('student_profiles')
        .select('user_id, full_name, phone');

    if (profilesError) throw profilesError;

    setStudentProfiles(profilesData || []);
    console.log(
  'AFAQ MATCH TEST:',
  (enrollmentsData || []).map((enrollment) => ({
    student_id: enrollment.student_id,
    student: (profilesData || []).find(
      (profile) =>
        String(profile.user_id).trim() ===
        String(enrollment.student_id).trim()
    )
  }))
);
    console.log('AFAQ student profiles:', profilesData);
console.log('AFAQ enrollments:', enrollmentsData);
  } else {
    setStudentProfiles([]);
  }
} else {
  setEnrollments([]);
  setStudentProfiles([]);
}
    } catch (error) {
      console.error('AFAQ database error:', error);

      setDbError(
        error.message || 'تعذر الاتصال بقاعدة البيانات.'
      );

      setTeachers([]);
      setCourses([]);

    } finally {
      setLoading(false);
    }
  };

  // التحقق من صلاحية المسؤول
  const verifyAdmin = async () => {
    const { data, error } = await supabase.rpc(
      'is_afaq_admin'
    );

    if (error) {
      console.error(error);
      setIsAdmin(false);
      return false;
    }

    setIsAdmin(Boolean(data));
    return Boolean(data);
  };

  // تسجيل دخول المسؤول
  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: loginForm.email.trim(),
        password: loginForm.password
      });

    if (error) {
      setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      return;
    }

    setSession(data.session);

    const allowed = await verifyAdmin();

    if (allowed) {
      setView('admin');
      notify('تم تسجيل الدخول بنجاح.');
    } else {
      await supabase.auth.signOut();
      setSession(null);
      setAuthError('هذا الحساب غير مصرح له بإدارة آفاق.');
    }
  };

  // إنشاء حساب طالب وحفظ بياناته في student_profiles
  const handleStudentSignup = async (event) => {
    event.preventDefault();
    setAuthError('');

    const fullName = studentForm.fullName.trim();
    const phone = studentForm.phone.trim();
    const email = studentForm.email.trim();
    const password = studentForm.password;

    if (!fullName || !email || password.length < 6) {
      setAuthError('اكتب الاسم والبريد الإلكتروني، واجعل كلمة المرور 6 أحرف على الأقل.');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } }
      });
      if (error) throw error;

      if (data.session && data.user) {
        const { error: profileError } = await supabase
          .from('student_profiles')
          .upsert({ user_id: data.user.id, full_name: fullName, phone }, { onConflict: 'user_id' });
        if (profileError) throw profileError;
        setSession(data.session);
        setStudentProfile({ full_name: fullName, phone });
        setView('student');
        notify('تم إنشاء حسابك بنجاح. أهلًا بك في آفاق!');
      } else {
        notify('تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده، ثم سجّل الدخول.');
        setAuthMode('login');
        setStudentForm((form) => ({ ...form, password: '' }));
      }
    } catch (error) {
      console.error('Student signup error:', error);
      setAuthError(error.message || 'تعذر إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  // تسجيل دخول الطالب أو المسؤول بنفس شاشة الدخول
  const handleStudentLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setSaving(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: studentForm.email.trim(),
        password: studentForm.password
      });
      if (error) throw error;

      setSession(data.session);
const allowed = await verifyAdmin();

if (allowed) {
  await loadAfaqData();

  setView('admin');
  notify('تم تسجيل دخول المسؤول بنجاح.');
  return;
}

      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
                .select('full_name, phone')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      if (!profile) {
        const metadata = data.user.user_metadata || {};
        const newProfile = {
          user_id: data.user.id,
          full_name: metadata.full_name || data.user.email?.split('@')[0] || 'طالب',
          phone: metadata.phone || ''
        };
        const { error: insertError } = await supabase.from('student_profiles').insert(newProfile);
        if (insertError) throw insertError;
        setStudentProfile({ full_name: newProfile.full_name, phone: newProfile.phone });
      } else {
        setStudentProfile(profile);
      }
      setView('student');
      notify('أهلًا بك مرة أخرى في آفاق.');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'تعذر تسجيل الدخول. راجع البيانات وحاول مجددًا.');
    } finally {
      setSaving(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setIsAdmin(false);
    setStudentProfile(null);
    setView('student');
    setAdminTab('dashboard');

    notify('تم تسجيل الخروج.');
  };

  // متابعة حالة تسجيل الدخول
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);

      if (data.session) {
        const admin = await verifyAdmin();
        if (!admin) {
          const { data: profile } = await supabase
            .from('student_profiles')
            .select('full_name, phone')
            .eq('user_id', data.session.user.id)
            .maybeSingle();
          if (mounted) setStudentProfile(profile || null);
        }
      }

      if (mounted) {
        setAuthLoading(false);
      }
    };

    initialize();
    loadAfaqData();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          if (!mounted) return;

          setSession(currentSession);

          if (!currentSession) {
            setIsAdmin(false);
          } else {
            await verifyAdmin();
          }

          setAuthLoading(false);
        }
      );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // الفلاتر
  const selectedStageData = stages.find(
    (stage) => stage.name === stageFilter
  );

  const gradeOptions = selectedStageData?.grades || [];
  const subjectOptions = selectedStageData?.subjects || [];

  // المدرسون الظاهرون
  const visibleTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesStage =
        stageFilter === 'الكل' ||
        teacher.stage === stageFilter;

      const matchesGrade =
        gradeFilter === 'الكل' ||
        (teacher.grades || []).includes(gradeFilter);

      const matchesSubject =
        subjectFilter === 'الكل' ||
        teacher.subject === subjectFilter;

      const matchesSearch =
        `${teacher.name} ${teacher.subject}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesStage &&
        matchesGrade &&
        matchesSubject &&
        matchesSearch
      );
    });
  }, [
    teachers,
    stageFilter,
    gradeFilter,
    subjectFilter,
    search
  ]);

  // الكورسات الظاهرة
  const visibleCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesStage =
        stageFilter === 'الكل' ||
        course.stage === stageFilter;

      const matchesGrade =
        gradeFilter === 'الكل' ||
        course.grade === gradeFilter;

      const matchesSubject =
        subjectFilter === 'الكل' ||
        course.subject === subjectFilter;

      const matchesSearch =
        `${course.title} ${course.subject}`
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesStage &&
        matchesGrade &&
        matchesSubject &&
        matchesSearch
      );
    });
  }, [
    courses,
    stageFilter,
    gradeFilter,
    subjectFilter,
    search
  ]);

  // إعادة ضبط نموذج المدرس
  const resetTeacherForm = () => {
    setTeacherForm({
      name: '',
      subject: '',
      stage: '',
      grades: [],
      bio: '',
      phone: '',
      image: ''
    });

    setEditingTeacher(null);
  };

  // إعادة ضبط نموذج الكورس
  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      teacherId: '',
      stage: '',
      grade: '',
      subject: '',
      price: '',
      description: '',
      type: 'مسجل'
    });

    setEditingCourse(null);
  };

  // إضافة أو تعديل مدرس
  const saveTeacher = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      notify('يجب تسجيل الدخول بحساب المسؤول أولًا.');
      return;
    }

    if (
      !teacherForm.name.trim() ||
      !teacherForm.stage ||
      !teacherForm.subject ||
      teacherForm.grades.length === 0
    ) {
      notify('أكمل اسم المدرس والمرحلة والمادة والصفوف.');
      return;
    }

    setSaving(true);

    const teacherData = {
      name: teacherForm.name.trim(),
      stage: teacherForm.stage,
      subject: teacherForm.subject,
      grades: teacherForm.grades,
      phone: teacherForm.phone.trim(),
      image_url: teacherForm.image.trim(),
      bio: teacherForm.bio.trim()
    };

    try {
      let result;

      if (editingTeacher !== null) {
        result = await supabase
          .from('teachers')
          .update(teacherData)
          .eq('id', editingTeacher);
      } else {
        result = await supabase
          .from('teachers')
          .insert([teacherData]);
      }

      if (result.error) throw result.error;

      await loadAfaqData();
      resetTeacherForm();

      notify(
        editingTeacher !== null
          ? 'تم تحديث بيانات المدرس.'
          : 'تمت إضافة المدرس بنجاح.'
      );
    } catch (error) {
      console.error('Save teacher error:', error);
      notify(`تعذر حفظ المدرس: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // تعديل بيانات مدرس
  const editTeacher = (teacher) => {
    setTeacherForm({
      name: teacher.name || '',
      subject: teacher.subject || '',
      stage: teacher.stage || '',
      grades: [...(teacher.grades || [])],
      bio: teacher.bio || '',
      phone: teacher.phone || '',
      image: teacher.image || ''
    });

    setEditingTeacher(teacher.id);
    setAdminTab('teachers');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // حذف مدرس
  const deleteTeacher = async (teacher) => {
    if (!isAdmin) {
      notify('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const confirmed = window.confirm(
      `هل تريد حذف المدرس ${teacher.name}؟`
    );

    if (!confirmed) return;
        setSaving(true);

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacher.id);

      if (error) throw error;

      await loadAfaqData();

      notify('تم حذف المدرس بنجاح.');
    } catch (error) {
      console.error('Delete teacher error:', error);
      notify(`تعذر حذف المدرس: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // إضافة أو تعديل كورس
  const saveCourse = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      notify('يجب تسجيل الدخول بحساب المسؤول أولًا.');
      return;
    }

    if (
      !courseForm.title.trim() ||
      !courseForm.teacherId ||
      !courseForm.stage ||
      !courseForm.grade ||
      !courseForm.subject
    ) {
      notify('أكمل البيانات الأساسية للكورس.');
      return;
    }

    setSaving(true);

    const courseData = {
      title: courseForm.title.trim(),
      teacher_id: courseForm.teacherId,
      stage: courseForm.stage,
      grade: courseForm.grade,
      subject: courseForm.subject,
      price: Number(courseForm.price) || 0,
      description: courseForm.description.trim(),
      type: courseForm.type
    };

    try {
      let result;

      if (editingCourse !== null) {
        result = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse);
      } else {
        result = await supabase
          .from('courses')
          .insert([courseData]);
      }

      if (result.error) throw result.error;

      await loadAfaqData();
      resetCourseForm();

      notify(
        editingCourse !== null
          ? 'تم تحديث الكورس.'
          : 'تمت إضافة الكورس بنجاح.'
      );
    } catch (error) {
      console.error('Save course error:', error);
      notify(`تعذر حفظ الكورس: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // تعديل كورس
  const editCourse = (course) => {
    setCourseForm({
      title: course.title || '',
      teacherId: String(course.teacherId || ''),
      stage: course.stage || '',
      grade: course.grade || '',
      subject: course.subject || '',
      price: String(course.price ?? ''),
      description: course.description || '',
      type: course.type || 'مسجل'
    });

    setEditingCourse(course.id);
    setAdminTab('courses');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // حذف كورس
  const deleteCourse = async (course) => {
    if (!isAdmin) {
      notify('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const confirmed = window.confirm(
      `هل تريد حذف الكورس ${course.title}؟`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;

      await loadAfaqData();

      notify('تم حذف الكورس بنجاح.');
    } catch (error) {
      console.error('Delete course error:', error);
      notify(`تعذر حذف الكورس: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // تغيير مرحلة المدرس
  const updateTeacherStage = (stage) => {
    setTeacherForm((form) => ({
      ...form,
      stage,
      subject: '',
      grades: []
    }));
  };

  // تغيير مرحلة الكورس
  const updateCourseStage = (stage) => {
    setCourseForm((form) => ({
      ...form,
      stage,
      grade: '',
      subject: ''
    }));
  };

  // اختيار صفوف المدرس
  const toggleTeacherGrade = (grade) => {
    setTeacherForm((form) => ({
      ...form,
      grades: form.grades.includes(grade)
        ? form.grades.filter((item) => item !== grade)
        : [...form.grades, grade]
    }));
  };

  // اسم المدرس المرتبط بالكورس
  const filteredEnrollments = enrollments.filter((enrollment) => {
  const student = studentProfiles.find(
    (profile) => profile.user_id === enrollment.student_id
  );

  const matchesStatus =
    enrollmentFilter === 'all' ||
    enrollment.status === enrollmentFilter;

  const searchText = enrollmentSearch.trim().toLowerCase();

  const matchesSearch =
    !searchText ||
    (student?.full_name || '').toLowerCase().includes(searchText) ||
    (student?.phone || '').includes(searchText);

  return matchesStatus && matchesSearch;
});
  const teacherName = (id) => {
    return (
      teachers.find(
        (teacher) => String(teacher.id) === String(id)
      )?.name || 'مدرس غير محدد'
    );
  };

  // بيانات المرحلة المختارة في النماذج
  const teacherStageData = stages.find(
    (stage) => stage.name === teacherForm.stage
  );

  const courseStageData = stages.find(
    (stage) => stage.name === courseForm.stage
  );

  // بداية واجهة الموقع
  return (
    <div className="app" dir="rtl">

      <header className="navbar">

        <a
          className="brand"
          href="#home"
          onClick={() => setView('student')}
        >
          <span className="brand-icon">آ</span>

          <span>
            <strong>آفاق</strong>
            <small>AFAQ EDUCATION</small>
          </span>
        </a>

        <nav>
          <button
            className={
              view === 'student' ? 'nav-link active' : 'nav-link'
            }
            onClick={() => setView('student')}
          >
            الرئيسية
          </button>

          <a
            className="nav-link"
            href="#catalog"
            onClick={() => setView('student')}
          >
            المراحل التعليمية
          </a>

          <a className="nav-link" href="#features">
            مميزاتنا
          </a>

          <button
            className={
              view === 'admin' ? 'nav-link active' : 'nav-link'
            }
            onClick={() => {
              if (isAdmin) {
                setView('admin');
              } else {
                setView('login');
              }
            }}
          >
            إدارة المنصة
          </button>
        </nav>

        {session ? (
          <div className="account-actions">
            {isAdmin ? <span className="account-name">المسؤول</span> : <span className="account-name">{studentProfile?.full_name || 'حسابي'}</span>}
            <button className="login-btn" type="button" onClick={handleLogout}>تسجيل الخروج</button>
          </div>
        ) : (
          <button className="login-btn" type="button" onClick={() => { setAuthMode('login'); setView('login'); }}>دخول / حساب جديد</button>
        )}

      </header>

      {/* تسجيل دخول الطلاب والمسؤولين وإنشاء حساب طالب */}
      {view === 'login' && (
        <main className="admin-page auth-page">
          <section className="admin-panel auth-panel">
            <div className="section-title">
              <span>مرحبًا بك في آفاق</span>
              <h2>{authMode === 'signup' ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول'}</h2>
              <p>{authMode === 'signup' ? 'أنشئ حسابك لمتابعة رحلتك التعليمية.' : 'سجّل الدخول إلى حسابك لمتابعة رحلتك التعليمية.'}</p>
            </div>

            {authLoading ? (
              <p className="muted">جاري التحقق من الحساب...</p>
            ) : (
              <form className="admin-form auth-form" onSubmit={authMode === 'signup' ? handleStudentSignup : handleStudentLogin}>
                {authMode === 'signup' && (
                  <>
                    <label className="full-field">الاسم بالكامل
                      <input value={studentForm.fullName} onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })} placeholder="اكتب اسمك بالكامل" autoComplete="name" required />
                    </label>
                    <label className="full-field">رقم الهاتف
                      <input type="tel" inputMode="tel" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} placeholder="01xxxxxxxxx" autoComplete="tel" />
                    </label>
                  </>
                )}
                <label className="full-field">البريد الإلكتروني
                  <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="name@example.com" autoComplete="email" required />
                </label>
                <label className="full-field">كلمة المرور
                  <input type="password" value={studentForm.password} onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })} placeholder="6 أحرف على الأقل" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
                </label>
                {authError && <p className="form-hint full-field" role="alert">{authError}</p>}
                <div className="form-actions full-field auth-actions">
                  <button className="primary-btn" type="submit" disabled={saving}>
                    {saving ? 'جاري التنفيذ...' : authMode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'}
                  </button>
                  <button className="secondary-btn" type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthError(''); }}>
                    {authMode === 'signup' ? 'لديك حساب؟ سجّل الدخول' : 'ليس لديك حساب؟ أنشئ حسابًا'}
                  </button>
                  <button className="text-link auth-back" type="button" onClick={() => { setView('student'); setAuthError(''); }}>العودة إلى الصفحة الرئيسية</button>
                </div>
              </form>
            )}
                        <p className="auth-note">دخول المسؤولين ما زال متاحًا من خلال نفس شاشة تسجيل الدخول بالحساب الإداري المعتمد.</p>
          </section>
        </main>
      )}

      {/* واجهة الطالب */}
      {view === 'student' && (
        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <span className="eyebrow">منصتك التعليمية المتكاملة</span>
              <h1>
                افتح لنفسك
                <br />
                <span>آفاقًا جديدة</span>
                بالعلم
              </h1>
              <p>
                اكتشف أفضل المدرسين والكورسات التعليمية
                لجميع المراحل الدراسية في مكان واحد.
              </p>
              {session && !isAdmin && <p className="student-greeting">أهلًا {studentProfile?.full_name || 'بك'}، سعيدون بوجودك معنا.</p>}

              <a className="primary-btn" href="#catalog">
                ابدأ رحلتك التعليمية
              </a>
            </div>

            <div className="hero-visual">
              <div className="hero-circle">
                <span>📚</span>
              </div>
              <div className="floating-card">
                <strong>{teachers.length}+</strong>
                <span>مدرس متاح</span>
              </div>
              <div className="floating-card second">
                <strong>{courses.length}+</strong>
                <span>كورس تعليمي</span>
              </div>
            </div>
          </section>

          <section className="section catalog" id="catalog">
            <div className="section-title">
              <span>اكتشف آفاق</span>
              <h2>ابدأ من مرحلتك التعليمية</h2>
              <p>
                اختر المرحلة والصف والمادة للوصول إلى المحتوى المناسب.
              </p>
            </div>

            <div className="stage-grid">
              {stages.map((stage) => (
                <button
                  type="button"
                  className={
                    stageFilter === stage.name
                      ? 'stage-card selected'
                      : 'stage-card'
                  }
                  key={stage.name}
                  onClick={() => {
                    setStageFilter(stage.name);
                    setGradeFilter('الكل');
                    setSubjectFilter('الكل');
                  }}
                >
                  <span>{stage.icon}</span>
                  <strong>{stage.name}</strong>
                  <small>{stage.grades.length} صفوف دراسية</small>
                </button>
              ))}
            </div>

            <div className="filter-panel">
              <div className="filter-field">
                <label htmlFor="stage-filter">المرحلة التعليمية</label>
                <select
                  id="stage-filter"
                  value={stageFilter}
                  onChange={(e) => {
                    setStageFilter(e.target.value);
                    setGradeFilter('الكل');
                    setSubjectFilter('الكل');
                  }}
                >
                  <option value="الكل">كل المراحل</option>
                  {stages.map((stage) => (
                    <option key={stage.name} value={stage.name}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="grade-filter">الصف الدراسي</label>
                <select
                  id="grade-filter"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="الكل">كل الصفوف</option>
                  {stages
                    .filter(
                      (stage) =>
                        stageFilter === 'الكل' ||
                        stage.name === stageFilter
                    )
                    .flatMap((stage) => stage.grades)
                    .map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="subject-filter">المادة</label>
                <select
                  id="subject-filter"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                >
                  <option value="الكل">كل المواد</option>
                  {[
                    ...new Set(
                      stages
                        .filter(
                          (stage) =>
                            stageFilter === 'الكل' ||
                            stage.name === stageFilter
                        )
                        .flatMap((stage) => stage.subjects)
                    )
                  ].map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field search-field">
                <label htmlFor="catalog-search">بحث</label>
                <input
                  id="catalog-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن مدرس أو كورس..."
                />
              </div>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setStageFilter('الكل');
                  setGradeFilter('الكل');
                  setSubjectFilter('الكل');
                  setSearch('');
                }}
              >
                إعادة ضبط
              </button>
            </div>

            {dbError && (
              <div className="admin-notice">
                تعذر تحميل البيانات من قاعدة البيانات:
                {' '}{dbError}
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <span>⏳</span>
                <h3>جاري تحميل البيانات...</h3>
              </div>
            ) : (
              <>
                <div className="catalog-heading">
                  <div>
                    <span className="eyebrow">خبرات تعليمية</span>
                    <h3>المدرسون</h3>
                  </div>
                  <span className="result-count">
                    {visibleTeachers.length} مدرس
                  </span>
                </div>

                {visibleTeachers.length ? (
                  <div className="teacher-grid">
                    {visibleTeachers.map((teacher) => (
                      <article className="teacher-card" key={teacher.id}>
                        <div className="teacher-avatar">
                          {teacher.image ? (
                            <img src={teacher.image} alt={teacher.name} />
                          ) : (
                            <span>👨‍🏫</span>
                          )}
                        </div>

                        <div className="teacher-info">
                          <span className="tag">{teacher.subject}</span>
                          <h3>{teacher.name}</h3>
                          <p>{teacher.stage}</p>
                          <small>
                            {(teacher.grades || []).join('، ')}
                          </small>
                        </div>

                        <p className="teacher-bio">
                          {teacher.bio || 'مدرس متخصص في المادة.'}
                        </p>

                        {teacher.phone && (
                          <a
                            className="text-link"
                            href={`tel:${teacher.phone}`}
                          >
                            تواصل مع المدرس ←
                          </a>
                        )}

                        <div className="teacher-courses">
                          {
                            courses.filter(
                              (course) =>
                                String(course.teacherId) ===
                                String(teacher.id)
                            ).length
                          } كورس متاح
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span>👨‍🏫</span>
                    <h3>لا يوجد مدرسون مطابقون حاليًا</h3>
                    <p>ستظهر بيانات المدرسين هنا بعد إضافتها.</p>
                  </div>
                )}

                <div className="catalog-heading courses-heading">
                  <div>
                    <span className="eyebrow">ابدأ التعلم</span>
                    <h3>الكورسات التعليمية</h3>
                  </div>
                  <span className="result-count">
                    {visibleCourses.length} كورس
                  </span>
                </div>

                {visibleCourses.length ? (
                  <div className="course-grid">
                    {visibleCourses.map((course) => (
                      <article className="course-card" key={course.id}>
                        <div className="course-cover">
                          <span>📚</span>
                          <b>{course.type}</b>
                        </div>

                        <div className="course-body">
                          <span className="tag">{course.subject}</span>
                          <h3>{course.title}</h3>
                          <p>
                            {course.description ||
                              'تفاصيل الكورس ستضاف قريبًا.'}
                          </p>

                          <div className="course-meta">
                            <span>👨‍🏫 {teacherName(course.teacherId)}</span>
                            <span>🎓 {course.grade}</span>
                          </div>

                          <div className="course-bottom">
                            <strong>
                              {Number(course.price) === 0
                                ? 'مجاني'
                                : `${course.price} جنيه`}
                            </strong>
                            <button
                              type="button"
                              onClick={async () => {
  if (!session?.user) {
    notify('سجل الدخول أولًا للاشتراك في الكورس');
    return;
  }

  try {
    const { data: existingEnrollment, error: checkError } =
  await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', session.user.id)
    .eq('course_id', course.id)
    .maybeSingle();

if (checkError) throw checkError;

if (existingEnrollment) {
  notify('أنت مشترك بالفعل في هذا الكورس');
  return;
}
    const { error } = await supabase
      .from('enrollments')
      .insert({
        student_id: session.user.id,
        course_id: course.id,
        status: 'pending',
        payment_status:
          Number(course.price) === 0
            ? 'not_required'
            : 'pending'
      });

    if (error) throw error;

    notify('تم إرسال طلب الاشتراك بنجاح');
  } catch (error) {
    console.error('Enrollment error:', error);
    notify(error.message || 'حدث خطأ أثناء الاشتراك');
  }
}}
                            >
                              تفاصيل الكورس
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                                      </div>
                ) : (
                  <div className="empty-state compact">
                    <span>🎥</span>
                    <h3>لا توجد كورسات مضافة بعد</h3>
                    <p>ستظهر الكورسات هنا بمجرد إضافتها.</p>
                  </div>
                )}
              </>
            )}
          </section>
```jsx
{session && !isAdmin && (
  <section className="section catalog" id="my-courses">
    <div className="section-title">
      <span>مسيرتك التعليمية</span>
      <h2>كورساتي</h2>
      <p>تابع طلبات اشتراكك وحالة كل كورس.</p>
    </div>

    {enrollments.length > 0 ? (
      <div className="course-grid">
        {enrollments.map((enrollment) => {
          const course = courses.find(
            (item) => item.id === enrollment.course_id
          );

          return (
            <article
              className="course-card"
              key={enrollment.id}
            >
              <div className="course-body">
                <span className="tag">
                  {course?.subject || 'كورس تعليمي'}
                </span>

                <h3>
                  {course?.title || 'كورس غير متاح'}
                </h3>

                <p>
                  المدرس: {course ? teacherName(course.teacher_id) : '—'}
                </p>

                <div className="course-meta">
                  <span>
                    حالة الطلب: {
                      enrollment.status === 'pending'
                        ? 'قيد المراجعة'
                        : enrollment.status === 'approved'
                        ? 'تم القبول'
                        : enrollment.status === 'rejected'
                        ? 'مرفوض'
                        : enrollment.status
                    }
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    ) : (
      <div className="empty-state compact">
        <h3>لسه ما اشتركتش في أي كورس</h3>
        <p>اختار الكورس المناسب ليك من الكتالوج.</p>
      </div>
    )}
  </section>
)}
          <section className="features section" id="features">
            <div className="section-title">
              <span>لماذا آفاق؟</span>
              <h2>تجربة تعليمية مختلفة</h2>
            </div>

            <div className="feature-grid">
              <article>
                <span>🎯</span>
                <h3>تعلم منظم</h3>
                <p>محتوى مرتب حسب المرحلة والصف والمادة.</p>
              </article>
              <article>
                <span>👨‍🏫</span>
                <h3>مدرسون متخصصون</h3>
                <p>اكتشف المدرسين والكورسات المناسبة لك.</p>
              </article>
              <article>
                <span>📝</span>
                <h3>اختبارات وتقييم</h3>
                <p>مساحة جاهزة لإضافة الاختبارات ومتابعة التقدم.</p>
              </article>
            </div>
          </section>

          <section className="about section" id="about">
            <span>آفاق AFAQ</span>
            <h2>التعليم هو بداية كل مستقبل عظيم.</h2>
            <p>
              نفتح أبواب المعرفة أمام كل طالب،
              ونساعد كل مدرس على تقديم أفضل ما لديه.
            </p>
          </section>
        </main>
      )}

      {/* لوحة الإدارة */}
      {view === 'admin' && isAdmin && (
        <main className="admin-page">
          <div className="admin-welcome">
            <div>
              <span className="eyebrow">لوحة الإدارة</span>
              <h1>إدارة منصة <span>آفاق</span></h1>
              <p>أدر المدرسين والكورسات من مكان واحد.</p>
            </div>

            <button
              className="secondary-btn"
              onClick={() => setView('student')}
            >
              عرض واجهة الطالب
            </button>
          </div>

          <div className="admin-stats">
            <div className="stat-card">
              <span>👨‍🏫</span>
              <strong>{teachers.length}</strong>
              <small>المدرسون</small>
            </div>
            <div className="stat-card">
              <span>🎥</span>
              <strong>{courses.length}</strong>
              <small>الكورسات</small>
            </div>
            <div className="stat-card">
              <span>🏫</span>
              <strong>{stages.length}</strong>
              <small>المراحل التعليمية</small>
            </div>
          </div>

          <div className="admin-tabs">
            
{[
  ['dashboard', 'نظرة عامة'],
  ['teachers', 'المدرسون'],
  ['courses', 'الكورسات'],
  ['enrollments', 'طلبات الاشتراك'],
].map(([tab, label]) => (
  <button
    key={tab}
    className={adminTab === tab ? 'active' : ''}
    onClick={() => setAdminTab(tab)}
  >
    {label}
  </button>
))}

          </div>

          {adminTab === 'dashboard' && (
            <section className="admin-panel">
              <h2>مرحبًا بك في لوحة آفاق</h2>
              <p>البيانات المعروضة يتم تحميلها من قاعدة البيانات.</p>

              <div className="quick-actions">
                <button
                  className="primary-btn"
                  onClick={() => setAdminTab('teachers')}
                >
                  إدارة المدرسين
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setAdminTab('courses')}
                >
                  إدارة الكورسات
                </button>
                <button
                  className="secondary-btn"
                  onClick={loadAfaqData}
                >
                  تحديث البيانات ↻
                </button>
              </div>
            </section>
          )}

{adminTab === 'enrollments' && (
  <section className="admin-panel">
    <div className="panel-title">
      <div>
        <span className="eyebrow">إدارة الطلاب</span>
        <h2>طلبات الاشتراك</h2>
      </div>
      <span className="result-count">
        {enrollments.length} طلب
      </span>
    </div>

    {enrollments.length > 0 ? (
      <div className="course-grid">
        <div className="enrollment-tools">
<div className="enrollment-stats">

  <div className="enrollment-stat">
    <strong>{enrollments.length}</strong>
    <span>إجمالي الطلبات</span>
  </div>

  <div className="enrollment-stat">
    <strong>
      {enrollments.filter((item) => item.status === 'pending').length}
    </strong>
    <span>معلّقة</span>
  </div>

  <div className="enrollment-stat">
    <strong>
      {enrollments.filter((item) => item.status === 'approved').length}
    </strong>
    <span>مقبولة</span>
  </div>

  <div className="enrollment-stat">
    <strong>
      {enrollments.filter((item) => item.status === 'rejected').length}
    </strong>
    <span>مرفوضة</span>
  </div>

</div>
  <input
    type="text"
    placeholder="ابحث باسم الطالب أو رقم الهاتف..."
    value={enrollmentSearch}
    onChange={(e) => setEnrollmentSearch(e.target.value)}
  />

  <select
    value={enrollmentFilter}
    onChange={(e) => setEnrollmentFilter(e.target.value)}
  >
    <option value="all">كل الطلبات</option>
    <option value="pending">طلبات معلّقة</option>
    <option value="approved">طلبات مقبولة</option>
    <option value="rejected">طلبات مرفوضة</option>
  </select>

</div>
{filteredEnrollments.length === 0 ? (
  <p className="muted">
    لا توجد طلبات تطابق البحث أو التصفية.
  </p>
) : (
  filteredEnrollments.map((enrollment) => {  
          const student = studentProfiles.find(
  (profile) => profile.user_id === enrollment.student_id
);
          const course = courses.find(
            (item) =>
              String(item.id) === String(enrollment.course_id)
          );

          return (
            <article className="course-card" key={enrollment.id}>
              <div className="course-body">
                <span className="tag">
                  {course?.subject || 'كورس تعليمي'}
                </span>

                <h3>{course?.title || 'كورس غير معروف'}</h3>
<div className="student-enrollment-info">
  <p>
    <strong>اسم الطالب:</strong>{' '}
    {student?.full_name || 'الاسم غير متاح'}
  </p>

  <p>
    <strong>رقم الهاتف:</strong>{' '}
    {student?.phone || 'غير مسجل'}
  </p>

  <p>
    <strong>رقم الحساب:</strong>{' '}
    {enrollment.student_id.slice(0, 8)}
  </p>

  <p>
    <strong>المدرس:</strong>{' '}
    {course ? teacherName(course.teacherId) : '—'}
  </p>
</div>

                <p>
                  حالة الطلب: {
                    enrollment.status === 'pending'
                      ? 'قيد المراجعة'
                      : enrollment.status === 'approved'
                      ? 'تم القبول'
                      : enrollment.status === 'rejected'
                      ? 'مرفوض'
                      : enrollment.status
                  }
                </p>

                <p>
                  حالة الدفع: {enrollment.payment_status}
                </p>

                {enrollment.status === 'pending' && (
                  <div className="course-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      disabled={saving}
                      onClick={async () => {
                        try {
                          setSaving(true);

                          const { error } = await supabase
                            .from('enrollments')
                            .update({ status: 'approved' })
                            .eq('id', enrollment.id);

                          if (error) throw error;

                          setEnrollments((prev) =>
                            prev.map((item) =>
                              item.id === enrollment.id
                                ? { ...item, status: 'approved' }
                                : item
                            )
                          );

                          notify('تم قبول طلب الاشتراك بنجاح');
                        } catch (error) {
                          notify(error.message || 'حدث خطأ أثناء قبول الطلب');
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      قبول الطلب
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      disabled={saving}
                      onClick={async () => {
                        try {
                          setSaving(true);

                          const { error } = await supabase
                            .from('enrollments')
                            .update({ status: 'rejected' })
                            .eq('id', enrollment.id);

                          if (error) throw error;

                          setEnrollments((prev) =>
                            prev.map((item) =>
                              item.id === enrollment.id
                                ? { ...item, status: 'rejected' }
                                : item
                            )
                          );

                          notify('تم رفض طلب الاشتراك');
                        } catch (error) {
                          notify(error.message || 'حدث خطأ أثناء رفض الطلب');
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      رفض الطلب
                    </button>
                  </div>
                )}
              </div>
            </article>
                   );
        })
      )}
    </div>
  ) : (
    <div className="empty-state compact">
      <h3>لا توجد طلبات اشتراك</h3>
      <p>ستظهر طلبات الطلاب هنا عند تسجيلهم في الكورسات.</p>
    </div>
  )}
</section>
)}
          {adminTab === 'teachers' && (
            <section className="admin-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">إدارة فريق التدريس</span>
                  <h2>
                    {editingTeacher ? 'تعديل بيانات مدرس' : 'إضافة مدرس جديد'}
                  </h2>
                </div>
                <span className="result-count">
                  {teachers.length} مدرس
                </span>
              </div>

              <form className="admin-form" onSubmit={saveTeacher}>
                <label>
                  اسم المدرس
                  <input
                    value={teacherForm.name}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        name: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  المرحلة التعليمية
                  <select
                    value={teacherForm.stage}
                    onChange={(e) => updateTeacherStage(e.target.value)}
                    required
                  >
                    <option value="">اختر المرحلة</option>
                    {stages.map((stage) => (
                      <option key={stage.name} value={stage.name}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  المادة
                  <select
                    value={teacherForm.subject}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        subject: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">اختر المادة</option>
                    {(teacherStageData?.subjects || []).map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="full-field">
                  <label>الصفوف التي يدرسها</label>
                  <div className="grade-checks">
                    {(teacherStageData?.grades || []).map((grade) => (
                      <label className="check-option" key={grade}>
                        <input
                          type="checkbox"
                          checked={teacherForm.grades.includes(grade)}
                          onChange={() => toggleTeacherGrade(grade)}
                        />
                        {grade}
                      </label>
                    ))}
                  </div>
                </div>

                <label>
                  رقم الهاتف
                  <input
                    value={teacherForm.phone}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        phone: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  رابط صورة المدرس
                  <input
                    type="url"
                    value={teacherForm.image}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        image: e.target.value
                      })
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="full-field">
                  نبذة عن المدرس
                  <textarea
                    value={teacherForm.bio}
                    onChange={(e) =>
                      setTeacherForm({
                        ...teacherForm,
                        bio: e.target.value
                      })
                    }
                    rows="3"
                  />
                </label>

                <div className="form-actions full-field">
                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? 'جاري الحفظ...'
                      : editingTeacher
                        ? 'حفظ التعديلات'
                        : 'إضافة المدرس'}
                  </button>

                  {editingTeacher && (
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={resetTeacherForm}
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </form>

              <div className="managed-list">
                {teachers.map((teacher) => (
                  <article className="managed-item" key={teacher.id}>
                    <div className="mini-avatar">
                      {teacher.image ? (
                        <img src={teacher.image} alt="" />
                      ) : (
                        '👨‍🏫'
                      )}
                    </div>

                    <div className="managed-info">
                      <strong>{teacher.name}</strong>
                      <span>{teacher.subject} · {teacher.stage}</span>
                      <small>{(teacher.grades || []).join('، ')}</small>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        onClick={() => editTeacher(teacher)}
                      >
                        تعديل
                                              </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteTeacher(teacher)}
                        disabled={saving}
                      >
                        حذف
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {adminTab === 'courses' && (
            <section className="admin-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">إدارة المحتوى التعليمي</span>
                  <h2>
                    {editingCourse ? 'تعديل كورس' : 'إضافة كورس جديد'}
                  </h2>
                </div>
                <span className="result-count">
                  {courses.length} كورس
                </span>
              </div>

              <form className="admin-form" onSubmit={saveCourse}>
                <label>
                  اسم الكورس
                  <input
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        title: e.target.value
                      })
                    }
                    required
                  />
                </label>

                <label>
                  المدرس
                  <select
                    value={courseForm.teacherId}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        teacherId: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">اختر المدرس</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  المرحلة التعليمية
                  <select
                    value={courseForm.stage}
                    onChange={(e) => updateCourseStage(e.target.value)}
                    required
                  >
                    <option value="">اختر المرحلة</option>
                    {stages.map((stage) => (
                      <option key={stage.name} value={stage.name}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  الصف الدراسي
                  <select
                    value={courseForm.grade}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        grade: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">اختر الصف</option>
                    {(courseStageData?.grades || []).map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  المادة
                  <select
                    value={courseForm.subject}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        subject: e.target.value
                      })
                    }
                    required
                  >
                    <option value="">اختر المادة</option>
                    {(courseStageData?.subjects || []).map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  سعر الكورس بالجنيه
                  <input
                    type="number"
                    min="0"
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        price: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  نوع الكورس
                  <select
                    value={courseForm.type}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        type: e.target.value
                      })
                    }
                  >
                    <option value="مسجل">مسجل</option>
                    <option value="مباشر">مباشر</option>
                    <option value="مجاني">مجاني</option>
                  </select>
                </label>

                <label className="full-field">
                  وصف الكورس
                  <textarea
                    rows="3"
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value
                      })
                    }
                  />
                </label>

                <div className="form-actions full-field">
                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={saving || teachers.length === 0}
                  >
                    {saving
                      ? 'جاري الحفظ...'
                      : editingCourse
                        ? 'حفظ التعديلات'
                        : 'إضافة الكورس'}
                  </button>

                  {editingCourse && (
                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={resetCourseForm}
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </form>

              <div className="managed-list">
                {courses.map((course) => (
                  <article className="managed-item" key={course.id}>
                    <div className="mini-avatar">🎥</div>

                    <div className="managed-info">
                      <strong>{course.title}</strong>
                      <span>{course.subject} · {course.grade}</span>
                      <small>
                        {teacherName(course.teacherId)} ·
                        {' '}
                        {Number(course.price) === 0
                          ? 'مجاني'
                          : `${course.price} جنيه`}
                      </small>
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        onClick={() => editCourse(course)}
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteCourse(course)}
                        disabled={saving}
                      >
                        حذف
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      <footer>
        <strong>آفاق | AFAQ</strong>
        <p>تعليم يفتح لك آفاق المستقبل.</p>
        <small>
          © {new Date().getFullYear()} جميع الحقوق محفوظة.
        </small>
      </footer>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </div>
  );
}

export default App;
