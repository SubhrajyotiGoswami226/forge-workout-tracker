import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { createRoot } from "react-dom/client";

import {
  supabase
} from "./lib/supabase";

import "./styles.css";

/* =========================================================
   CONSTANTS
   ========================================================= */

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const TRAINING_TYPES = [
  "Push",
  "Pull",
  "Legs"
];

/* =========================================================
   DEFAULT FORGE PLAN
   ========================================================= */

const DEFAULT_PLAN = {
  Push: {
    day1: [
      {
        name: "Upper Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Mid Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Lower Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Overhead Press",
        sets: 3,
        reps: 12
      },
      {
        name: "Cable Pushdown",
        sets: 3,
        reps: 12
      },
      {
        name: "Skull Crushers",
        sets: 3,
        reps: 12
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: 12
      }
    ],
    day2: [
      {
        name: "Overhead Press",
        sets: 3,
        reps: 10
      },
      {
        name: "Upper Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Mid Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Lower Cable Chest Fly",
        sets: 3,
        reps: 12
      },
      {
        name: "Cable Fly",
        sets: 3,
        reps: 15
      },
      {
        name: "Cable Pushdown",
        sets: 3,
        reps: 15
      },
      {
        name: "Skull Crushers",
        sets: 3,
        reps: 15
      },
      {
        name: "Lateral Raise",
        sets: 3,
        reps: 15
      }
    ]
  },

  Pull: {
    day1: [
      {
        name: "Pullups",
        sets: 3,
        reps: 12
      },
      {
        name: "Straight Arm Pulldown",
        sets: 3,
        reps: 15
      },
      {
        name: "Seated Cable Rows",
        sets: 3,
        reps: 15
      },
      {
        name: "Shrugs",
        sets: 3,
        reps: 12
      },
      {
        name: "Barbell Curls",
        sets: 3,
        reps: 10
      },
      {
        name: "Hammer Curls",
        sets: 3,
        reps: 12
      },
      {
        name: "Preacher Curls",
        sets: 3,
        reps: 15
      },
      {
        name: "Rear Delt Flys",
        sets: 3,
        reps: 12
      }
    ],
    day2: [
      {
        name: "Barbell Rows",
        sets: 3,
        reps: 12
      },
      {
        name: "Seated Cable Row",
        sets: 3,
        reps: 15
      },
      {
        name: "Lateral Pulldown",
        sets: 3,
        reps: 15
      },
      {
        name: "Shrugs",
        sets: 3,
        reps: 12
      },
      {
        name: "Barbell Curls",
        sets: 3,
        reps: 10
      },
      {
        name: "Cable Hammer Curls",
        sets: 3,
        reps: 15
      },
      {
        name: "Concentrated Curl",
        sets: 3,
        reps: 10
      },
      {
        name: "Face Pulls",
        sets: 3,
        reps: 18
      }
    ]
  },

  Legs: {
    day1: [
      {
        name: "Squats",
        sets: 3,
        reps: 8
      },
      {
        name: "Lunges",
        sets: 3,
        reps: 15
      },
      {
        name: "Leg Extension",
        sets: 3,
        reps: 15
      },
      {
        name: "Romanian Deadlifts",
        sets: 3,
        reps: 12
      },
      {
        name: "Calves Raise",
        sets: 3,
        reps: 12
      }
    ],
    day2: [
      {
        name: "Hip Thrusts",
        sets: 3,
        reps: 10
      },
      {
        name: "Good Mornings",
        sets: 3,
        reps: 10
      },
      {
        name: "Hamstring Curl",
        sets: 3,
        reps: 15
      },
      {
        name: "Leg Press",
        sets: 3,
        reps: 15
      },
      {
        name: "Glute Kickbacks",
        sets: 3,
        reps: 15
      },
      {
        name: "Calve Raises",
        sets: 3,
        reps: 12
      }
    ]
  }
};

/* =========================================================
   HELPERS
   ========================================================= */

function todayName() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long"
    }
  ).format(new Date());
}

function formatDate(date) {
  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

function formatTime(date) {
  return new Date(
    date
  ).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function cloneDefaultPlan() {
  return JSON.parse(
    JSON.stringify(
      DEFAULT_PLAN
    )
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [session, setSession] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const {
        data: {
          session:
            currentSession
        }
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(
        currentSession
      );

      if (
        currentSession?.user
      ) {
        await loadProfile(
          currentSession.user.id
        );
      }

      setLoading(false);
    }

    initialize();

    const {
      data: {
        subscription
      }
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          currentSession
        ) => {
          setSession(
            currentSession
          );

          if (
            currentSession?.user
          ) {
            await loadProfile(
              currentSession.user.id
            );
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(
    userId
  ) {
    const {
      data,
      error
    } =
      await supabase
        .from("profiles")
        .select("*")
        .eq(
          "id",
          userId
        )
        .single();

    if (error) {
      console.error(
        "Profile error:",
        error
      );
      return;
    }

    setProfile(data);
  }

  async function logout() {
    await supabase.auth.signOut();

    setSession(null);
    setProfile(null);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Forge...
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  if (!profile) {
    return (
      <div className="loading-screen">
        Loading profile...
      </div>
    );
  }

  if (
    !profile.approved &&
    profile.role !== "admin"
  ) {
    return (
      <PendingApproval
        name={profile.name}
        onLogout={logout}
      />
    );
  }

  if (
    profile.role === "admin"
  ) {
    return (
      <AdminDashboard
        profile={profile}
        onLogout={logout}
      />
    );
  }

  return (
    <UserApplication
      profile={profile}
      onLogout={logout}
    />
  );
}

/* =========================================================
   AUTH
   ========================================================= */

function AuthPage() {
  const [mode, setMode] =
    useState("login");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function submit(
    event
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (
        mode === "login"
      ) {
        await login();
      } else {
        await signup();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function login() {
    const value =
      email.trim();

    if (!value) {
      setError(
        "Enter your email address."
      );

      return;
    }

    const {
      data,
      error
    } =
      await supabase.auth.signInWithPassword(
        {
          email: value,
          password
        }
      );

    if (error) {
      if (
        error.message
          ?.toLowerCase()
          .includes("email not confirmed")
      ) {
        setError(
          "Please check your email inbox and confirm your email before logging in."
        );
      } else {
        setError(
          error.message
        );
      }

      return;
    }

    if (!data?.user) {
      setError(
        "Unable to sign in."
      );

      return;
    }

    const {
      data: account,
      error: accountError
    } =
      await supabase
        .from("profiles")
        .select(
          "approved, role"
        )
        .eq(
          "id",
          data.user.id
        )
        .single();

    if (accountError) {
      await supabase.auth.signOut();

      setError(
        "Unable to verify your account."
      );

      return;
    }

    if (
      !account.approved &&
      account.role !== "admin"
    ) {
      await supabase.auth.signOut();

      setError(
        "Your account is waiting for admin approval."
      );
    }
  }

  async function signup() {
    const value =
      email.trim();

    if (!name.trim()) {
      setError(
        "Please enter your name."
      );

      return;
    }

    if (!value) {
      setError(
        "Enter your email address."
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    const {
      data,
      error
    } =
      await supabase.auth.signUp(
        {
          email: value,
          password,

          options: {
            data: {
              name:
                name.trim()
            }
          }
        }
      );

    if (error) {
      setError(
        error.message
      );

      return;
    }

    if (!data.session) {
      setMessage(
        "Account created. Check your email for verification, then wait for admin approval."
      );
    } else {
      setMessage(
        "Account created. Your account is waiting for admin approval."
      );
    }

    setName("");
    setEmail("");
    setPassword("");

    setMode("login");
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          FORGE<span>.</span>
        </div>

        <p className="eyebrow">
          {mode === "login"
            ? "WELCOME BACK"
            : "CREATE ACCOUNT"}
        </p>

        <h1 className="auth-title">
          {mode === "login"
            ? "Train smarter."
            : "Start your journey."}
        </h1>

        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to access your workouts and training history."
            : "Create your Forge account and build your own training system."}
        </p>

        <form
          className="auth-form"
          onSubmit={submit}
        >
          {mode === "signup" && (
            <label className="auth-field">
              <span>
                NAME
              </span>

              <input
                type="text"
                value={name}
                placeholder="Your name"
                required
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />
            </label>
          )}

          <label className="auth-field">
            <span>
              EMAIL
            </span>

            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              required
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />
          </label>

          <label className="auth-field">
            <span>
              PASSWORD
            </span>

            <input
              type="password"
              value={password}
              placeholder="Password"
              minLength={6}
              required
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn full"
            disabled={submitting}
          >
            {submitting
              ? "PLEASE WAIT..."
              : mode === "login"
                ? "LOGIN"
                : "CREATE ACCOUNT"}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(
              mode === "login"
                ? "signup"
                : "login"
            );

            setError("");
            setMessage("");
          }}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PENDING
   ========================================================= */

function PendingApproval({
  name,
  onLogout
}) {
  return (
    <div className="auth-shell">
      <div className="pending-card">
        <div className="complete-mark">
          …
        </div>

        <p className="eyebrow">
          ACCOUNT PENDING
        </p>

        <h1>
          Welcome, {name}.
        </h1>

        <p className="subtext">
          Your account has been
          created and is waiting
          for admin approval.
        </p>

        <button
          type="button"
          className="secondary-btn"
          onClick={onLogout}
        >
          LOG OUT
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   USER APPLICATION
   ========================================================= */

function UserApplication({
  profile,
  onLogout
}) {
  const [plan, setPlan] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editingPlan, setEditingPlan] =
    useState(false);

  const [screen, setScreen] =
    useState("dashboard");

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    setLoading(true);

    const {
      data,
      error
    } =
      await supabase
        .from("workout_plans")
        .select(
          `
          id,
          name,
          workout_days (
            id,
            day_of_week,
            training_type,
            split_day,
            workout_exercises (
              id,
              sets,
              reps,
              position,
              exercises (
                id,
                name
              )
            )
          )
        `
        )
        .eq(
          "user_id",
          profile.id
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Plan error:",
        error
      );
    }

    setPlan(data);
    setLoading(false);

    if (!data) {
      setEditingPlan(true);
    }
  }

  async function savePlan(
    builder
  ) {
    const saved =
      await saveUserPlan(
        profile.id,
        builder
      );

    if (!saved) {
      return false;
    }

    await loadPlan();

    setEditingPlan(false);

    return true;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading workout plan...
      </div>
    );
  }

  if (
    editingPlan ||
    !plan
  ) {
    return (
      <WorkoutSetup
        profile={profile}
        existingPlan={plan}
        onSave={savePlan}
        onLogout={onLogout}
      />
    );
  }

  if (
    screen === "session"
  ) {
    return (
      <WorkoutSession
        profile={profile}
        plan={plan}
        onComplete={() =>
          setScreen(
            "dashboard"
          )
        }
        onCancel={() =>
          setScreen(
            "dashboard"
          )
        }
      />
    );
  }

  if (
    screen === "history"
  ) {
    return (
      <HistoryPage
        profile={profile}
        onBack={() =>
          setScreen(
            "dashboard"
          )
        }
      />
    );
  }

  return (
    <Dashboard
      profile={profile}
      plan={plan}
      onLogout={onLogout}
      onEditPlan={() =>
        setEditingPlan(
          true
        )
      }
      onStartSession={() =>
        setScreen(
          "session"
        )
      }
      onHistory={() =>
        setScreen(
          "history"
        )
      }
    />
  );
}

/* =========================================================
   WORKOUT SETUP
   ========================================================= */

function WorkoutSetup({
  profile,
  existingPlan,
  onSave,
  onLogout
}) {
  const [step, setStep] =
    useState(1);

  const [planName, setPlanName] =
    useState(
      existingPlan?.name ||
        "My Workout"
    );

  const [assignments, setAssignments] =
    useState({
      Push: {
        days: [],
        day1: [],
        day2: []
      },

      Pull: {
        days: [],
        day1: [],
        day2: []
      },

      Legs: {
        days: [],
        day1: [],
        day2: []
      }
    });

  const [activeType, setActiveType] =
    useState("Push");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (existingPlan) {
      convertExistingPlan();
    }
  }, [existingPlan]);

  function convertExistingPlan() {
    const converted = {
      Push: {
        days: [],
        day1: [],
        day2: []
      },

      Pull: {
        days: [],
        day1: [],
        day2: []
      },

      Legs: {
        days: [],
        day1: [],
        day2: []
      }
    };

    existingPlan.workout_days?.forEach(
      (day) => {
        if (
          !converted[
            day.training_type
          ]
        ) {
          return;
        }

        converted[
          day.training_type
        ].days.push(
          day.day_of_week
        );

        const exercises =
          [
            ...(
              day.workout_exercises ||
              []
            )
          ].sort(
            (a, b) =>
              a.position -
              b.position
          );

        converted[
          day.training_type
        ][
          day.split_day === 1
            ? "day1"
            : "day2"
        ] =
          exercises.map(
            (item) => ({
              name:
                item.exercises?.name ||
                "",
              sets:
                item.sets,
              reps:
                item.reps
            })
          );
      }
    );

    setAssignments(
      converted
    );
  }

  function toggleDay(
    type,
    day
  ) {
    setAssignments(
      (current) => {
        const existing =
          current[type].days;

        if (
          existing.includes(day)
        ) {
          return {
            ...current,

            [type]: {
              ...current[type],

              days:
                existing.filter(
                  (item) =>
                    item !== day
                )
            }
          };
        }

        if (
          existing.length >= 2
        ) {
          return current;
        }

        return {
          ...current,

          [type]: {
            ...current[type],

            days: [
              ...existing,
              day
            ]
          }
        };
      }
    );
  }

  function loadForgeDefault() {
    const defaults =
      cloneDefaultPlan();

    setAssignments(
      (current) => ({
        ...current,

        [activeType]: {
          ...current[
            activeType
          ],

          day1:
            defaults[
              activeType
            ].day1,

          day2:
            defaults[
              activeType
            ].day2
        }
      })
    );
  }

  function setExercises(
    type,
    split,
    exercises
  ) {
    setAssignments(
      (current) => ({
        ...current,

        [type]: {
          ...current[type],

          [split]:
            exercises
        }
      })
    );
  }

  function nextStep() {
    setError("");

    if (step === 1) {
      const assignedDays =
        Object.values(
          assignments
        ).flatMap(
          (item) =>
            item.days
        );

      const uniqueDays =
        new Set(
          assignedDays
        );

      if (
        assignedDays.length !==
          6 ||
        uniqueDays.size !== 6
      ) {
        setError(
          "Assign exactly 2 different days to Push, Pull and Legs."
        );

        return;
      }

      setActiveType(
        "Push"
      );

      setStep(2);

      return;
    }

    if (step === 2) {
      setActiveType(
        "Pull"
      );

      setStep(3);

      return;
    }

    if (step === 3) {
      setActiveType(
        "Legs"
      );

      setStep(4);

      return;
    }
  }

  async function finishSetup() {
    setError("");
    setSaving(true);

    try {
      const success =
        await onSave({
          planName,
          assignments
        });

      if (!success) {
        setError(
          "Unable to save your workout plan. Check the browser console."
        );
      }
    } catch (error) {
      console.error(
        "Setup save error:",
        error
      );

      setError(
        error.message ||
          "Unable to save your workout plan."
      );
    } finally {
      setSaving(false);
    }
  }

  const current =
    assignments[
      activeType
    ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          FORGE<span>.</span>
        </div>

        <div className="topbar-right">
          <span className="date-pill">
            {profile.name}
          </span>

          <button
            type="button"
            className="history-btn"
            onClick={onLogout}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="container setup-container">
        <section className="setup-header">
          <p className="eyebrow">
            WORKOUT SETUP
          </p>

          <h1>
            Build your plan.
          </h1>

          <p className="subtext">
            Choose your training days
            and create the exact
            workouts you want to follow.
          </p>

          <div className="setup-progress">
            {[1, 2, 3, 4].map(
              (item) => (
                <span
                  key={item}
                  className={
                    item <= step
                      ? "active"
                      : ""
                  }
                />
              )
            )}
          </div>
        </section>

        {error && (
          <div className="auth-error setup-error">
            {error}
          </div>
        )}

        {step === 1 && (
          <section className="setup-card">
            <div className="setup-card-heading">
              <div>
                <p className="eyebrow">
                  STEP 1
                </p>

                <h2>
                  Choose your training days
                </h2>
              </div>
            </div>

            <label className="setup-name-field">
              <span>
                PLAN NAME
              </span>

              <input
                value={planName}
                onChange={(event) =>
                  setPlanName(
                    event.target.value
                  )
                }
              />
            </label>

            <div className="training-assignment-grid">
              {TRAINING_TYPES.map(
                (type) => (
                  <div
                    className="training-assignment"
                    key={type}
                  >
                    <div className="training-assignment-title">
                      <strong>
                        {type}
                      </strong>

                      <span>
                        {
                          assignments[
                            type
                          ].days.length
                        }{" "}
                        / 2 days
                      </span>
                    </div>

                    <div className="day-selector">
                      {WEEK_DAYS.map(
                        (day) => {
                          const selected =
                            assignments[
                              type
                            ].days.includes(
                              day
                            );

                          const usedByOther =
                            Object.entries(
                              assignments
                            ).some(
                              ([
                                otherType,
                                value
                              ]) =>
                                otherType !==
                                  type &&
                                value.days.includes(
                                  day
                                )
                            );

                          return (
                            <button
                              type="button"
                              key={day}
                              className={`day-option ${
                                selected
                                  ? "selected"
                                  : ""
                              }`}
                              disabled={
                                !selected &&
                                usedByOther
                              }
                              onClick={() =>
                                toggleDay(
                                  type,
                                  day
                                )
                              }
                            >
                              <strong>
                                {day.slice(
                                  0,
                                  3
                                )}
                              </strong>

                              <span>
                                {selected
                                  ? "SELECTED"
                                  : usedByOther
                                    ? "USED"
                                    : "SELECT"}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="setup-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={nextStep}
              >
                CONTINUE →
              </button>
            </div>
          </section>
        )}

        {step >= 2 && (
          <section className="setup-card">
            <div className="setup-card-heading">
              <div>
                <p className="eyebrow">
                  STEP {step}
                </p>

                <h2>
                  {activeType} workouts
                </h2>

                <p className="setup-description">
                  Assigned to{" "}
                  {current.days.join(
                    " & "
                  )}
                </p>
              </div>
            </div>

            <div className="builder-intro">
              <strong>
                Build Day 1
              </strong>

              <span>
                Add your exercises and
                set their defaults.
              </span>
            </div>

            <ExerciseBuilder
              exercises={
                current.day1
              }
              onChange={(items) =>
                setExercises(
                  activeType,
                  "day1",
                  items
                )
              }
            />

            <button
              type="button"
              className="default-plan-btn"
              onClick={
                loadForgeDefault
              }
            >
              USE FORGE DEFAULT
            </button>

            <div className="day-two-section">
              <div className="day-two-heading">
                <div>
                  <p className="eyebrow">
                    DAY 2
                  </p>

                  <h3>
                    Build Day 2
                  </h3>
                </div>

                <button
                  type="button"
                  className="secondary-btn compact"
                  onClick={() =>
                    setExercises(
                      activeType,
                      "day2",
                      current.day1.map(
                        (
                          exercise
                        ) => ({
                          ...exercise
                        })
                      )
                    )
                  }
                >
                  SAME AS DAY 1
                </button>
              </div>

              <ExerciseBuilder
                exercises={
                  current.day2
                }
                onChange={(items) =>
                  setExercises(
                    activeType,
                    "day2",
                    items
                  )
                }
              />
            </div>

            <div className="setup-actions">
              {step > 2 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setStep(
                      step - 1
                    )
                  }
                >
                  ← BACK
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={
                    nextStep
                  }
                >
                  NEXT{" "}
                  {
                    TRAINING_TYPES[
                      step - 1
                    ]
                  }{" "}
                  →
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={
                    finishSetup
                  }
                  disabled={saving}
                >
                  {saving
                    ? "SAVING..."
                    : "SAVE WORKOUT PLAN"}
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {saving && (
        <SavingOverlay />
      )}
    </div>
  );
}

/* =========================================================
   EXERCISE BUILDER
   ========================================================= */

function ExerciseBuilder({
  exercises,
  onChange
}) {
  function updateExercise(
    index,
    field,
    value
  ) {
    onChange(
      exercises.map(
        (exercise, i) =>
          i === index
            ? {
                ...exercise,
                [field]:
                  value
              }
            : exercise
      )
    );
  }

  function addExercise() {
    onChange([
      ...exercises,
      {
        name: "",
        sets: 3,
        reps: 12
      }
    ]);
  }

  function removeExercise(
    index
  ) {
    onChange(
      exercises.filter(
        (_, i) =>
          i !== index
      )
    );
  }

  return (
    <div className="exercise-builder">
      {exercises.length ===
        0 && (
        <div className="builder-empty">
          No exercises added yet.
        </div>
      )}

      {exercises.map(
        (exercise, index) => (
            <div
              className="builder-row"
              key={index}
            >
            <div className="builder-index">
              {String(
                index + 1
              ).padStart(2, "0")}
            </div>

            <input
              className="builder-exercise-name"
              value={
                exercise.name
              }
              placeholder="Exercise name"
              onChange={(event) =>
                updateExercise(
                  index,
                  "name",
                  event.target
                    .value
                )
              }
            />

            <input
              className="builder-small-input"
              type="number"
              min="1"
              value={
                exercise.sets
              }
              onChange={(event) =>
                updateExercise(
                  index,
                  "sets",
                  Number(
                    event.target
                      .value
                  ) || 1
                )
              }
            />

            <span className="builder-x">
              ×
            </span>

            <input
              className="builder-small-input"
              type="number"
              min="1"
              value={
                exercise.reps
              }
              onChange={(event) =>
                updateExercise(
                  index,
                  "reps",
                  Number(
                    event.target
                      .value
                  ) || 1
                )
              }
            />

            <button
              type="button"
              className="remove-exercise"
              onClick={() =>
                removeExercise(
                  index
                )
              }
            >
              ×
            </button>
          </div>
        )
      )}

      <button
        type="button"
        className="add-exercise-btn"
        onClick={addExercise}
      >
        + ADD EXERCISE
      </button>

      <p className="builder-hint">
        Sets and reps are saved as the
        default for the exercise.
      </p>
    </div>
  );
}

/* =========================================================
   SAVE USER PLAN
   ========================================================= */

async function saveUserPlan(
  userId,
  builder
) {
  const {
    planName,
    assignments
  } = builder;

  const {
    data: existingPlan,
    error: existingPlanError
  } = await supabase
    .from("workout_plans")
    .select("id")
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (existingPlanError) {
    console.error(
      "Existing plan lookup:",
      existingPlanError
    );

    return false;
  }

  if (existingPlan) {
    const {
      error
    } = await supabase
      .from("workout_plans")
      .delete()
      .eq(
        "id",
        existingPlan.id
      );

    if (error) {
      console.error(
        "Delete plan:",
        error
      );

      return false;
    }
  }

  const {
    data: plan,
    error: planError
  } = await supabase
    .from("workout_plans")
    .insert({
      user_id: userId,
      name:
        planName?.trim() ||
        "My Workout"
    })
    .select()
    .single();

  if (planError) {
    console.error(
      "Create plan:",
      planError
    );

    return false;
  }

  for (
    const type of TRAINING_TYPES
  ) {
    const typeData =
      assignments[type];

    if (!typeData) {
      continue;
    }

    for (
      let i = 0;
      i < typeData.days.length;
      i++
    ) {
      const day =
        typeData.days[i];

      const splitDay =
        i === 0
          ? 1
          : 2;

      const {
        data: workoutDay,
        error: dayError
      } = await supabase
        .from("workout_days")
        .insert({
          plan_id:
            plan.id,

          day_of_week:
            day,

          training_type:
            type,

          split_day:
            splitDay
        })
        .select()
        .single();

      if (dayError) {
        console.error(
          "Create workout day:",
          dayError
        );

        return false;
      }

      const exercises =
        i === 0
          ? typeData.day1
          : typeData.day2;

      if (!Array.isArray(exercises)) {
        continue;
      }

      for (
        let position = 0;
        position < exercises.length;
        position++
      ) {
        const exercise =
          exercises[position];

        if (
          !exercise?.name ||
          !exercise.name.trim()
        ) {
          continue;
        }

        const exerciseName =
          exercise.name.trim();

        let {
          data: existingExercise,
          error: exerciseLookupError
        } = await supabase
          .from("exercises")
          .select("id")
          .ilike(
            "name",
            exerciseName
          )
          .maybeSingle();

        if (
          exerciseLookupError
        ) {
          console.error(
            "Exercise lookup:",
            exerciseLookupError
          );

          return false;
        }

        if (!existingExercise) {
          const {
            data: newExercise,
            error: newExerciseError
          } = await supabase
            .from("exercises")
            .insert({
              name:
                exerciseName,

              is_custom:
                true,

              created_by:
                userId
            })
            .select()
            .single();

          if (newExerciseError) {
            console.error(
              "Create exercise:",
              newExerciseError
            );

            return false;
          }

          existingExercise =
            newExercise;
        }

        const {
          error:
            workoutExerciseError
        } = await supabase
          .from(
            "workout_exercises"
          )
          .insert({
            workout_day_id:
              workoutDay.id,

            exercise_id:
              existingExercise.id,

            sets:
              Number(
                exercise.sets
              ) || 3,

            reps:
              Number(
                exercise.reps
              ) || 12,

            position
          });

        if (
          workoutExerciseError
        ) {
          console.error(
            "Save workout exercise:",
            workoutExerciseError
          );

          return false;
        }
      }
    }
  }

  return true;
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  profile,
  plan,
  onLogout,
  onEditPlan,
  onStartSession,
  onHistory
}) {
  const [todayWorkout, setTodayWorkout] =
    useState(null);

  const [stats, setStats] =
    useState({
      sessions: 0,
      volume: 0,
      lastWeight: 0
    });

  useEffect(() => {
    const today =
      todayName();

    const match =
      plan.workout_days?.find(
        (day) =>
          day.day_of_week ===
          today
      );

    setTodayWorkout(
      match || null
    );

    loadStats();
  }, [plan]);

  async function loadStats() {
    const {
      data: sessions,
      error
    } =
      await supabase
        .from(
          "workout_sessions"
        )
        .select(
          "id, completed_at"
        )
        .eq(
          "user_id",
          profile.id
        )
        .not(
          "completed_at",
          "is",
          null
        );

    if (error) {
      console.error(
        "Stats session error:",
        error
      );

      return;
    }

    const sessionIds =
      sessions?.map(
        (item) => item.id
      ) || [];

    if (
      sessionIds.length === 0
    ) {
      setStats({
        sessions: 0,
        volume: 0,
        lastWeight: 0
      });

      return;
    }

    const {
      data: logs,
      error: logsError
    } =
      await supabase
        .from(
          "workout_logs"
        )
        .select(
          "weight, reps, created_at"
        )
        .in(
          "session_id",
          sessionIds
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (logsError) {
      console.error(
        "Stats logs error:",
        logsError
      );

      return;
    }

    const volume =
      logs?.reduce(
        (
          sum,
          log
        ) =>
          sum +
          (Number(
            log.weight
          ) || 0) *
            (Number(
              log.reps
            ) || 0),
        0
      ) || 0;

    const lastWeight =
      logs?.[0]?.weight || 0;

    setStats({
      sessions:
        sessions.length,

      volume,

      lastWeight
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          FORGE<span>.</span>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="nav-action history-action"
            onClick={onHistory}
          >
            HISTORY
          </button>

          <div className="account-chip">
            <div className="account-avatar">
              {profile.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="account-info">
              <span>ACCOUNT</span>
              <strong>
                {profile.name || "User"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="nav-action logout-action"
            onClick={onLogout}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">
              TRAINING DASHBOARD
            </p>

            <h1>
              Build strength.
              <br />
              <span>
                Track everything.
              </span>
            </h1>

            <p className="subtext">
              Your training history,
              workout plan and
              progression — all in one
              place.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn hero-btn"
            onClick={
              onStartSession
            }
            disabled={
              !todayWorkout
            }
          >
            <span>
              {todayWorkout
                ? "START SESSION"
                : "REST DAY"}
            </span>

            <span>
              →
            </span>
          </button>
        </section>

        <section className="stats-grid">
          <StatCard
            label="SESSIONS"
            value={
              stats.sessions
            }
            suffix=""
          />

          <StatCard
            label="TOTAL VOLUME"
            value={Math.round(
              stats.volume
            ).toLocaleString()}
            suffix=" kg"
          />

          <StatCard
            label="LAST LOGGED"
            value={
              stats.lastWeight
            }
            suffix=" kg"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                TODAY
              </p>

              <h2>
                {todayWorkout
                  ? `${
                      todayWorkout.training_type
                    } Day ${
                      todayWorkout.split_day
                    }`
                  : "Rest Day"}
              </h2>
            </div>

            <button
              type="button"
              className="nav-action edit-action"
              onClick={onEditPlan}
            >
              EDIT PLAN
            </button>
          </div>

          {todayWorkout ? (
            <div className="exercise-preview">
              {[
                ...(
                  todayWorkout.workout_exercises ||
                  []
                )
              ]
                .sort(
                  (a, b) =>
                    a.position -
                    b.position
                )
                .map(
                  (
                    exercise,
                    index
                  ) => (
                    <div
                      className="exercise-row"
                      key={
                        exercise.id
                      }
                    >
                      <div className="exercise-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="exercise-copy">
                        <strong>
                          {
                            exercise
                              .exercises
                              ?.name
                          }
                        </strong>

                        <span>
                          {
                            exercise.sets
                          }{" "}
                          sets ×{" "}
                          {
                            exercise.reps
                          }{" "}
                          reps
                        </span>
                      </div>

                      <span className="weight">
                        {
                          exercise.sets
                        }{" "}
                        ×{" "}
                        {
                          exercise.reps
                        }
                      </span>
                    </div>
                  )
                )}
            </div>
          ) : (
            <div className="rest-preview">
              <span className="rest-icon">
                R
              </span>

              <div>
                <strong>
                  Recovery Day
                </strong>

                <p>
                  No workout scheduled
                  today.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   WORKOUT SESSION
   ========================================================= */

function WorkoutSession({
  profile,
  plan,
  onComplete,
  onCancel
}) {
  const [todayWorkout, setTodayWorkout] =
    useState(null);

  const [
    exerciseIndex,
    setExerciseIndex
  ] = useState(0);

  const [
    activeExercise,
    setActiveExercise
  ] = useState(null);

  const [
    sessionId,
    setSessionId
  ] = useState(null);

  const [started, setStarted] =
    useState(false);

  const [
    savingExercise,
    setSavingExercise
  ] = useState(false);

  const [
    completing,
    setCompleting
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    initializeSession();
  }, []);

  async function initializeSession() {
    const today =
      todayName();

    const workout =
      plan.workout_days?.find(
        (day) =>
          day.day_of_week ===
          today
      );

    if (!workout) {
      setError(
        "No workout is assigned for today."
      );

      return;
    }

    const {
      data,
      error
    } =
      await supabase
        .from(
          "workout_sessions"
        )
        .insert({
          user_id:
            profile.id,

          workout_day_id:
            workout.id
        })
        .select()
        .single();

    if (error) {
      console.error(
        "Create session error:",
        error
      );

      setError(
        "Unable to start your workout session."
      );

      return;
    }

    setTodayWorkout(
      workout
    );

    setSessionId(
      data.id
    );

    setExerciseIndex(0);

    prepareExercise(
      workout,
      0
    );
  }

  function prepareExercise(
    workout,
    index
  ) {
    const exercises =
      [
        ...(workout
          .workout_exercises ||
          [])
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const exercise =
      exercises[index];

    if (!exercise) {
      return;
    }

    setActiveExercise({
      id:
        exercise.id,

      exerciseId:
        exercise
          .exercises
          ?.id,

      name:
        exercise
          .exercises
          ?.name ||
        "Exercise",

      sets:
        exercise.sets,

      reps:
        exercise.reps,

      weight:
        ""
    });

    setStarted(false);
  }

  function startExercise() {
    if (!activeExercise) {
      return;
    }

    setStarted(true);
  }

  async function finishExercise() {
    if (
      !activeExercise ||
      !sessionId ||
      savingExercise
    ) {
      return;
    }

    setSavingExercise(
      true
    );

    setError("");

    const sets =
      Math.max(
        1,
        Number(
          activeExercise.sets
        ) || 1
      );

    const reps =
      Math.max(
        1,
        Number(
          activeExercise.reps
        ) || 1
      );

    const weight =
      Number(
        activeExercise.weight
      ) || 0;

    const logs =
      Array.from(
        {
          length:
            sets
        },
        (_, index) => ({
          session_id:
            sessionId,

          exercise_id:
            activeExercise.exerciseId,

          set_number:
            index + 1,

          reps,

          weight
        })
      );

    const {
      error
    } =
      await supabase
        .from(
          "workout_logs"
        )
        .insert(logs);

    if (error) {
      console.error(
        "Save workout logs:",
        error
      );

      setError(
        "Unable to save this exercise."
      );

      setSavingExercise(
        false
      );

      return;
    }

    const nextIndex =
      exerciseIndex + 1;

    const totalExercises =
      todayWorkout
        .workout_exercises
        .length;

    if (
      nextIndex <
      totalExercises
    ) {
      setExerciseIndex(
        nextIndex
      );

      prepareExercise(
        todayWorkout,
        nextIndex
      );

      setSavingExercise(
        false
      );

      return;
    }

    await finishWorkout();

    setSavingExercise(
      false
    );
  }

  async function finishWorkout() {
    if (
      !sessionId ||
      completing
    ) {
      return;
    }

    setCompleting(true);

    const {
      error
    } =
      await supabase
        .from(
          "workout_sessions"
        )
        .update({
          completed_at:
            new Date().toISOString()
        })
        .eq(
          "id",
          sessionId
        );

    if (error) {
      console.error(
        "Complete workout:",
        error
      );

      setError(
        "Workout was logged, but completion could not be recorded."
      );

      setCompleting(false);

      return;
    }

    setCompleting(false);

    onComplete();
  }

  if (
    error &&
    !todayWorkout
  ) {
    return (
      <div className="app-shell">
        <TopNav
          onBack={onCancel}
        />

        <main className="container narrow complete-screen">
          <div className="complete-mark">
            !
          </div>

          <p className="eyebrow">
            SESSION ERROR
          </p>

          <h1>
            Unable to start.
          </h1>

          <p className="subtext">
            {error}
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={onCancel}
          >
            BACK TO DASHBOARD
          </button>
        </main>
      </div>
    );
  }

  if (
    !todayWorkout ||
    !activeExercise
  ) {
    return (
      <div className="loading-screen">
        Starting workout...
      </div>
    );
  }

  const exercises =
    [
      ...(
        todayWorkout
          .workout_exercises ||
        []
      )
    ].sort(
      (a, b) =>
        a.position -
        b.position
    );

  const lastExercise =
    exerciseIndex ===
    exercises.length - 1;

  return (
    <div className="app-shell">
      <TopNav
        onBack={onCancel}
      />

      <main className="container narrow">
        <section className="flow-head">
          <p className="eyebrow">
            EXERCISE{" "}
            {exerciseIndex + 1} /{" "}
            {exercises.length}
          </p>

          <h1>
            {
              todayWorkout.training_type
            }{" "}
            Day{" "}
            {
              todayWorkout.split_day
            }
          </h1>

          <p className="subtext">
            Start with the first exercise.
            Your programmed sets and reps
            are already filled in.
          </p>

          <div className="progress-line">
            {exercises.map(
              (_, index) => (
                <span
                  key={index}
                  className={
                    index <=
                    exerciseIndex
                      ? "active"
                      : ""
                  }
                />
              )
            )}
          </div>
        </section>

        {error && (
          <div className="auth-error setup-error">
            {error}
          </div>
        )}

        <section className="session-card">
          <div className="exercise-index">
            EXERCISE{" "}
            {String(
              exerciseIndex + 1
            ).padStart(2, "0")}
          </div>

          <h2>
            {
              activeExercise.name
            }
          </h2>

          <div className="target-row">
            <div>
              <span>
                DEFAULT SETS
              </span>

              <strong>
                {
                  activeExercise.sets
                }
              </strong>
            </div>

            <div>
              <span>
                DEFAULT REPS
              </span>

              <strong>
                {
                  activeExercise.reps
                }
              </strong>
            </div>

            <div>
              <span>
                WEIGHT
              </span>

              <strong>
                —
              </strong>
            </div>
          </div>

          <div className="exercise-entry-grid">
            <Field
              label="SETS"
              value={
                activeExercise.sets
              }
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    sets:
                      value
                  })
                )
              }
            />

            <Field
              label="REPS"
              value={
                activeExercise.reps
              }
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    reps:
                      value
                  })
                )
              }
            />

            <Field
              label="WEIGHT (KG)"
              value={
                activeExercise.weight
              }
              placeholder="Optional"
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    weight:
                      value
                  })
                )
              }
            />
          </div>

          {!started ? (
            <button
              type="button"
              className="primary-btn full start-exercise"
              onClick={
                startExercise
              }
            >
              START EXERCISE
            </button>
          ) : (
            <div className="running-card">
              <div className="running-orb"></div>

              <p>
                EXERCISE ACTIVE
              </p>

              <strong>
                {
                  activeExercise.sets
                }{" "}
                sets ×{" "}
                {
                  activeExercise.reps
                }{" "}
                reps

                {activeExercise.weight !==
                  "" &&
                  ` @ ${activeExercise.weight} kg`}
              </strong>

              <button
                type="button"
                className="primary-btn full"
                disabled={
                  savingExercise ||
                  completing
                }
                onClick={
                  finishExercise
                }
              >
                {savingExercise
                  ? "SAVING..."
                  : completing
                    ? "FINISHING..."
                    : lastExercise
                      ? "FINISH WORKOUT"
                      : "DONE — NEXT EXERCISE →"}
              </button>
            </div>
          )}
        </section>

        <section className="session-queue">
          {exercises.map(
            (
              exercise,
              index
            ) => (
              <div
                className={`session-queue-row ${
                  index ===
                  exerciseIndex
                    ? "current"
                    : index <
                        exerciseIndex
                      ? "completed"
                      : ""
                }`}
                key={exercise.id}
              >
                <span>
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <strong>
                  {
                    exercise
                      .exercises
                      ?.name
                  }
                </strong>

                <small>
                  {
                    exercise.sets
                  }{" "}
                  ×{" "}
                  {
                    exercise.reps
                  }
                </small>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   HISTORY
   ========================================================= */

function HistoryPage({
  profile,
  onBack
}) {
  const [sessions, setSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);

    const {
      data,
      error
    } =
      await supabase
        .from(
          "workout_sessions"
        )
        .select(
          `
          id,
          started_at,
          completed_at,
          workout_days (
            day_of_week,
            training_type,
            split_day
          ),
          workout_logs (
            id,
            exercise_id,
            set_number,
            reps,
            weight,
            created_at,
            exercises (
              name
            )
          )
        `
        )
        .eq(
          "user_id",
          profile.id
        )
        .not(
          "completed_at",
          "is",
          null
        )
        .order(
          "started_at",
          {
            ascending: false
          }
        );

    if (error) {
      console.error(
        "History error:",
        error
      );

      setError(
        "Unable to load workout history."
      );
    } else {
      setSessions(
        data || []
      );
    }

    setLoading(false);
  }

  if (
    selectedSession
  ) {
    return (
      <HistoryDetail
        session={
          selectedSession
        }
        onBack={() =>
          setSelectedSession(
            null
          )
        }
      />
    );
  }

  return (
    <div className="app-shell">
      <TopNav
        onBack={onBack}
      />

      <main className="container history-container">
        <section className="history-header">
          <p className="eyebrow">
            TRAINING HISTORY
          </p>

          <h1>
            Previous workouts.
          </h1>

          <p className="subtext">
            Every completed workout is
            stored in your Forge account.
          </p>
        </section>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-history">
            Loading history...
          </div>
        ) : sessions.length ===
          0 ? (
          <div className="empty-history">
            <div className="empty-history-icon">
              —
            </div>

            <h2>
              No workouts yet.
            </h2>

            <p>
              Complete your first workout
              and it will appear here.
            </p>
          </div>
        ) : (
          <div className="history-list">
            {sessions.map(
              (session) => {
                const logs =
                  session.workout_logs ||
                  [];

                const volume =
                  logs.reduce(
                    (
                      sum,
                      log
                    ) =>
                      sum +
                      (Number(
                        log.weight
                      ) || 0) *
                        (Number(
                          log.reps
                        ) || 0),
                    0
                  );

                const exercises =
                  new Set(
                    logs.map(
                      (log) =>
                        log.exercise_id
                    )
                  ).size;

                return (
                  <button
                    type="button"
                    className="history-card"
                    key={
                      session.id
                    }
                    onClick={() =>
                      setSelectedSession(
                        session
                      )
                    }
                  >
                    <div className="history-card-date">
                      <span>
                        {formatDate(
                          session.started_at
                        )}
                      </span>

                      <strong>
                        {session.workout_days
                          ?.training_type ||
                          "Workout"}{" "}
                        Day{" "}
                        {
                          session
                            .workout_days
                            ?.split_day
                        }
                      </strong>

                      <small>
                        {
                          session
                            .workout_days
                            ?.day_of_week
                        }{" "}
                        ·{" "}
                        {formatTime(
                          session.started_at
                        )}
                      </small>
                    </div>

                    <div className="history-card-stats">
                      <div>
                        <span>
                          EXERCISES
                        </span>

                        <strong>
                          {exercises}
                        </strong>
                      </div>

                      <div>
                        <span>
                          VOLUME
                        </span>

                        <strong>
                          {Math.round(
                            volume
                          )}{" "}
                          kg
                        </strong>
                      </div>

                      <span className="history-arrow">
                        →
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   HISTORY DETAIL
   ========================================================= */

function HistoryDetail({
  session,
  onBack
}) {
  const groupedExercises =
    useMemo(() => {
      const groups = {};

      (
        session.workout_logs ||
        []
      )
        .sort(
          (a, b) => {
            if (
              a.exercise_id ===
              b.exercise_id
            ) {
              return (
                a.set_number -
                b.set_number
              );
            }

            return a.created_at.localeCompare(
              b.created_at
            );
          }
        )
        .forEach((log) => {
          const name =
            log.exercises
              ?.name ||
            "Exercise";

          if (
            !groups[name]
          ) {
            groups[name] =
              [];
          }

          groups[name].push(
            log
          );
        });

      return Object.entries(
        groups
      );
    }, [session]);

  const totalVolume =
    (
      session.workout_logs ||
      []
    ).reduce(
      (sum, log) =>
        sum +
        (Number(
          log.weight
        ) || 0) *
          (Number(
            log.reps
          ) || 0),
      0
    );

  return (
    <div className="app-shell">
      <TopNav
        onBack={onBack}
      />

      <main className="container history-container">
        <button
          type="button"
          className="history-back"
          onClick={onBack}
        >
          ← BACK TO HISTORY
        </button>

        <section className="history-detail-heading">
          <div>
            <p className="eyebrow">
              {formatDate(
                session.started_at
              )}
            </p>

            <h2>
              {session
                .workout_days
                ?.training_type ||
                "Workout"}{" "}
              Day{" "}
              {
                session
                  .workout_days
                  ?.split_day
              }
            </h2>

            <p className="history-detail-date">
              {
                session
                  .workout_days
                  ?.day_of_week
              }{" "}
              ·{" "}
              {formatTime(
                session.started_at
              )}
            </p>
          </div>

          <div className="history-detail-volume">
            <span>
              TOTAL VOLUME
            </span>

            <strong>
              {Math.round(
                totalVolume
              )}{" "}
              kg
            </strong>
          </div>
        </section>

        <div className="history-exercises">
          {groupedExercises.map(
            ([
              exerciseName,
              logs
            ]) => (
              <section
                className="history-exercise"
                key={
                  exerciseName
                }
              >
                <div className="history-exercise-title">
                  <h3>
                    {
                      exerciseName
                    }
                  </h3>

                  <span>
                    {logs.length}{" "}
                    sets
                  </span>
                </div>

                <div className="set-table">
                  <div className="set-table-header">
                    <span>
                      SET
                    </span>

                    <span>
                      REPS
                    </span>

                    <span>
                      WEIGHT
                    </span>

                    <span>
                      VOLUME
                    </span>
                  </div>

                  {logs.map(
                    (log) => (
                      <div
                        className="set-row"
                        key={log.id}
                      >
                        <span>
                          {
                            log.set_number
                          }
                        </span>

                        <span>
                          {log.reps}
                        </span>

                        <span>
                          {Number(
                            log.weight
                          ) > 0
                            ? `${log.weight} kg`
                            : "BW"}
                        </span>

                        <span>
                          {Number(
                            log.weight
                          ) > 0
                            ? `${Number(log.weight) * Number(log.reps)} kg`
                            : "—"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   ADMIN
   ========================================================= */

function AdminDashboard({
  profile,
  onLogout
}) {
  const [users, setUsers] =
    useState([]);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);

    const {
      data,
      error
    } =
      await supabase
        .from("profiles")
        .select("*")
        .eq(
          "role",
          "user"
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    if (error) {
      setError(
        error.message
      );
    } else {
      setUsers(
        data || []
      );
    }

    setLoadingUsers(false);
  }

  async function approveUser(
    userId
  ) {
    setError("");

    const {
      error
    } =
      await supabase
        .from("profiles")
        .update({
          approved: true
        })
        .eq(
          "id",
          userId
        );

    if (error) {
      setError(
        error.message
      );

      return;
    }

    setUsers(
      (current) =>
        current.map(
          (user) =>
            user.id ===
            userId
              ? {
                  ...user,
                  approved:
                    true
                }
              : user
        )
    );
  }

  const pending =
    users.filter(
      (user) =>
        !user.approved
    );

  const approved =
    users.filter(
      (user) =>
        user.approved
    );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          FORGE<span>.</span>
        </div>

        <div className="topbar-right">
          <span className="admin-badge">
            ADMIN
          </span>

          <div className="account-chip">
            <div className="account-avatar">
              {profile.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </div>

            <div className="account-info">
              <span>ACCOUNT</span>
              <strong>
                {profile.name || "Admin"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="nav-action logout-action"
            onClick={onLogout}
          >
            LOG OUT
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">
              ADMIN DASHBOARD
            </p>

            <h1>
              Account
              <br />
              <span>
                management.
              </span>
            </h1>

            <p className="subtext">
              Manage Forge registrations
              and approve new members.
            </p>
          </div>
        </section>

        {error && (
          <div className="auth-error admin-error">
            {error}
          </div>
        )}

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                PENDING
              </p>

              <h2>
                Approve Accounts
              </h2>
            </div>

            <span className="count">
              {
                pending.length
              }{" "}
              pending
            </span>
          </div>

          {loadingUsers ? (
            <div className="empty">
              Loading accounts...
            </div>
          ) : pending.length ===
            0 ? (
            <div className="empty">
              No pending accounts.
            </div>
          ) : (
            <div className="admin-user-list">
              {pending.map(
                (user) => (
                  <div
                    className="admin-user-row"
                    key={user.id}
                  >
                    <div>
                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.email ||
                          "No email"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() =>
                        approveUser(
                          user.id
                        )
                      }
                    >
                      APPROVE
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                MEMBERS
              </p>

              <h2>
                Approved Users
              </h2>
            </div>

            <span className="count">
              {
                approved.length
              }
            </span>
          </div>

          {approved.length ===
          0 ? (
            <div className="empty">
              No approved users yet.
            </div>
          ) : (
            <div className="admin-user-list">
              {approved.map(
                (user) => (
                  <div
                    className="admin-user-row"
                    key={user.id}
                  >
                    <div>
                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.email ||
                          "No email"}
                      </span>
                    </div>

                    <span className="approved-label">
                      APPROVED
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function StatCard({
  label,
  value,
  suffix = ""
}) {
  return (
    <div className="stat-card">
      <span>
        {label}
      </span>

      <strong>
        {value}
        <em>
          {suffix}
        </em>
      </strong>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder = "",
  onChange
}) {
  return (
    <label className="field">
      <span>
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

function TopNav({
  onBack
}) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="nav-action back-action"
        onClick={onBack}
      >
        <span className="nav-icon">←</span>
        <span>BACK</span>
      </button>

      <div className="brand">
        FORGE<span>.</span>
      </div>

      <div className="top-spacer"></div>
    </header>
  );
}

function SavingOverlay() {
  return (
    <div className="saving-overlay">
      <div className="saving-modal">
        <div className="saving-spinner">
          <div className="spinner-ring"></div>
        </div>

        <p className="eyebrow">
          SAVING
        </p>

        <h2>
          Saving your workout.
        </h2>

        <p>
          Setting up your personal
          training plan. Please wait...
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   RENDER
   ========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);