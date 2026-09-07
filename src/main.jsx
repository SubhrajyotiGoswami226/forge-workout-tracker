import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const PROGRAM = {
  Monday: {
    label: "Pull Day 1",
    type: "Pull",
    exercises: [
      { id: "pullups", name: "Pullups", sets: 3, reps: 12 },
      { id: "straight-arm-pulldown", name: "Straight Arm Pulldown", sets: 3, reps: 15 },
      { id: "seated-cable-rows", name: "Seated Cable Rows", sets: 3, reps: 15 },
      { id: "shrugs", name: "Shrugs", sets: 3, reps: 12 },
      { id: "barbell-curls", name: "Barbell Curls", sets: 3, reps: 10 },
      { id: "hammer-curls", name: "Hammer Curls", sets: 3, reps: 12 },
      { id: "preacher-curls", name: "Preacher Curls", sets: 3, reps: 15 },
      { id: "rear-delt-flys", name: "Rear Delt Flys", sets: 3, reps: 12 }
    ]
  },

  Tuesday: {
    label: "Leg Day 1",
    type: "Legs",
    exercises: [
      { id: "squats", name: "Squats", sets: 3, reps: 8 },
      { id: "lunges", name: "Lunges", sets: 3, reps: 15 },
      { id: "leg-extension", name: "Leg Extension", sets: 3, reps: 15 },
      { id: "romanian-deadlifts", name: "Romanian Deadlifts", sets: 3, reps: 12 },
      { id: "calves-raise", name: "Calves Raise", sets: 3, reps: 12 }
    ]
  },

  Wednesday: {
    label: "Push Day 1",
    type: "Push",
    exercises: [
      { id: "upper-cable-chest-fly", name: "Upper Cable Chest Fly", sets: 3, reps: 12 },
      { id: "mid-cable-chest-fly", name: "Mid Cable Chest Fly", sets: 3, reps: 12 },
      { id: "lower-cable-chest-fly", name: "Lower Cable Chest Fly", sets: 3, reps: 12 },
      { id: "overhead-press", name: "Overhead Press", sets: 3, reps: 12 },
      { id: "cable-pushdown", name: "Cable Pushdown", sets: 3, reps: 12 },
      { id: "skull-crushers", name: "Skull Crushers", sets: 3, reps: 12 },
      { id: "lateral-raises", name: "Lateral Raises", sets: 3, reps: 12 }
    ]
  },

  Thursday: {
    label: "Pull Day 2",
    type: "Pull",
    exercises: [
      { id: "barbell-rows", name: "Barbell Rows", sets: 3, reps: 12 },
      { id: "seated-cable-row", name: "Seated Cable Row", sets: 3, reps: 15 },
      { id: "lateral-pulldown", name: "Lateral Pulldown", sets: 3, reps: 15 },
      { id: "shrugs", name: "Shrugs", sets: 3, reps: 12 },
      { id: "barbell-curls", name: "Barbell Curls", sets: 3, reps: 10 },
      { id: "cable-hammer-curls", name: "Cable Hammer Curls", sets: 3, reps: 15 },
      { id: "concentrated-curl", name: "Concentrated Curl", sets: 3, reps: 10 },
      { id: "face-pulls", name: "Face Pulls", sets: 3, reps: 18 }
    ]
  },

  Friday: {
    label: "Leg Day 2",
    type: "Legs",
    exercises: [
      { id: "hip-thrusts", name: "Hip Thrusts", sets: 3, reps: 10 },
      { id: "good-mornings", name: "Good Mornings", sets: 3, reps: 10 },
      { id: "hamstring-curl", name: "Hamstring Curl", sets: 3, reps: 15 },
      { id: "leg-press", name: "Leg Press", sets: 3, reps: 15 },
      { id: "glute-kickbacks", name: "Glute Kickbacks", sets: 3, reps: 15 },
      { id: "calve-raises", name: "Calve Raises", sets: 3, reps: 12 }
    ]
  },

  Saturday: {
    label: "Push Day 2",
    type: "Push",
    exercises: [
      { id: "overhead-press", name: "Overhead Press", sets: 3, reps: 10 },
      { id: "upper-cable-chest-fly", name: "Upper Cable Chest Fly", sets: 3, reps: 12 },
      { id: "mid-cable-chest-fly", name: "Mid Cable Chest Fly", sets: 3, reps: 12 },
      { id: "lower-cable-chest-fly", name: "Lower Cable Chest Fly", sets: 3, reps: 12 },
      { id: "cable-fly", name: "Cable Fly", sets: 3, reps: 15 },
      { id: "cable-pushdown", name: "Cable Pushdown", sets: 3, reps: 15 },
      { id: "skull-crushers", name: "Skull Crushers", sets: 3, reps: 15 },
      { id: "lateral-raise", name: "Lateral Raise", sets: 3, reps: 15 }
    ]
  },

  Sunday: {
    label: "Rest Day",
    type: "Rest",
    exercises: []
  }
};

function todayName() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long"
  }).format(new Date());
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function loadHistory() {
  try {
    const saved = localStorage.getItem("forge-history");

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [history, setHistory] = useState(loadHistory);

  const [screen, setScreen] = useState("home");

  const [day, setDay] = useState(todayName());

  const [exerciseIndex, setExerciseIndex] = useState(0);

  const [activeExercise, setActiveExercise] = useState(null);

  const [currentSession, setCurrentSession] = useState([]);

  const [sessionId, setSessionId] = useState(null);

  const [selectedHistorySession, setSelectedHistorySession] =
    useState(null);

  useEffect(() => {
    localStorage.setItem(
      "forge-history",
      JSON.stringify(history)
    );
  }, [history]);

  const workout = PROGRAM[day] || PROGRAM.Monday;

  const exercises = workout.exercises;

  const currentExercise = exercises[exerciseIndex];

  const stats = useMemo(() => {
    const sessionIds = new Set(
      history
        .map((item) => item.sessionId)
        .filter(Boolean)
    );

    const totalVolume = history.reduce(
      (total, item) => {
        return (
          total +
          (Number(item.weight) || 0) *
            (Number(item.reps) || 0)
        );
      },
      0
    );

    const lastEntry =
      history.length > 0
        ? history[history.length - 1]
        : null;

    return {
      totalSessions: sessionIds.size,
      totalVolume,
      lastWeight: lastEntry?.weight || 0
    };
  }, [history]);

  const groupedHistory = useMemo(() => {
    const groups = {};

    [...history]
      .sort((a, b) => {
        return (
          Number(b.sessionId || 0) -
          Number(a.sessionId || 0)
        );
      })
      .forEach((entry) => {
        const id = entry.sessionId;

        if (!groups[id]) {
          groups[id] = {
            sessionId: id,
            date: entry.date,
            day: entry.day,
            workout: entry.workout,
            entries: []
          };
        }

        groups[id].entries.push(entry);
      });

    return Object.values(groups);
  }, [history]);

  function startSession() {
    const today = todayName();

    const todayWorkout = PROGRAM[today];

    if (!todayWorkout) {
      return;
    }

    setDay(today);
    setExerciseIndex(0);
    setActiveExercise(null);
    setCurrentSession([]);

    const newSessionId = Date.now();

    setSessionId(newSessionId);

    if (
      todayWorkout.type === "Rest" ||
      todayWorkout.exercises.length === 0
    ) {
      setScreen("rest");
      return;
    }

    setScreen("plan");
  }

  function configureExercise(exercise) {
    if (!exercise) {
      return;
    }

    setActiveExercise({
      ...exercise,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: "",
      started: false
    });

    setScreen("exercise");
  }

  function continueWithDefault() {
    if (!currentExercise) {
      return;
    }

    setActiveExercise({
      ...currentExercise,
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      weight: "",
      started: false
    });

    setScreen("exercise");
  }

  function startExercise() {
    if (!activeExercise) {
      return;
    }

    setActiveExercise((current) => ({
      ...current,
      started: true
    }));
  }

  function finishExercise() {
    if (!activeExercise) {
      return;
    }

    const requestedSets =
      Number(activeExercise.sets);

    const requestedReps =
      Number(activeExercise.reps);

    const weight =
      activeExercise.weight === ""
        ? 0
        : Number(activeExercise.weight) || 0;

    const finalSets =
      requestedSets > 0
        ? requestedSets
        : activeExercise.sets;

    const finalReps =
      requestedReps > 0
        ? requestedReps
        : activeExercise.reps;

    const newEntries = Array.from(
      { length: finalSets },
      (_, index) => ({
        id: `${sessionId}-${activeExercise.id}-${index + 1}-${Date.now()}`,
        sessionId,
        date: new Date()
          .toISOString()
          .slice(0, 10),
        day,
        workout: workout.label,
        exercise: activeExercise.name,
        exerciseId: activeExercise.id,
        set: index + 1,
        weight,
        reps: finalReps
      })
    );

    setHistory((previous) => [
      ...previous,
      ...newEntries
    ]);

    setCurrentSession((previous) => [
      ...previous,
      ...newEntries
    ]);

    if (
      exerciseIndex <
      exercises.length - 1
    ) {
      setExerciseIndex(
        (previous) => previous + 1
      );

      setActiveExercise(null);

      setScreen("plan");

      return;
    }

    setScreen("complete");
  }

  function cancelSession() {
    setScreen("home");
    setActiveExercise(null);
    setCurrentSession([]);
    setExerciseIndex(0);
  }

  function openHistory() {
    setSelectedHistorySession(null);
    setScreen("history");
  }

  /* =======================================================
     HOME
     ======================================================= */

  if (screen === "home") {
    const todayWorkout =
      PROGRAM[todayName()] || PROGRAM.Monday;

    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            FORGE<span>.</span>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="history-btn"
              onClick={openHistory}
            >
              HISTORY
            </button>

            <div className="date-pill">
              {todayName()}
            </div>
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
                Your training history, workout plan
                and progression — all in one place.
              </p>
            </div>

            <button
              type="button"
              className="primary-btn hero-btn"
              onClick={startSession}
            >
              <span>START SESSION</span>
              <span>→</span>
            </button>
          </section>

          <section className="stats-grid">
            <StatCard
              label="SESSIONS"
              value={stats.totalSessions}
              suffix=""
            />

            <StatCard
              label="TOTAL VOLUME"
              value={Math.round(
                stats.totalVolume
              ).toLocaleString()}
              suffix=" kg"
            />

            <StatCard
              label="LAST LOGGED"
              value={stats.lastWeight}
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
                  {todayWorkout.label}
                </h2>
              </div>

              {todayWorkout.type !== "Rest" && (
                <span className="count">
                  {
                    todayWorkout.exercises
                      .length
                  }{" "}
                  exercises
                </span>
              )}
            </div>

            {todayWorkout.type === "Rest" ? (
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
            ) : (
              <div className="exercise-preview">
                {todayWorkout.exercises.map(
                  (exercise, index) => (
                    <div
                      className="exercise-row"
                      key={`${exercise.id}-${index}`}
                    >
                      <div className="exercise-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="exercise-copy">
                        <strong>
                          {exercise.name}
                        </strong>

                        <span>
                          {exercise.sets}{" "}
                          sets ×{" "}
                          {exercise.reps}{" "}
                          reps
                        </span>
                      </div>

                      <span className="weight">
                        {exercise.sets} ×{" "}
                        {exercise.reps}
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

  /* =======================================================
     HISTORY
     ======================================================= */

  if (screen === "history") {
    return (
      <div className="app-shell">
        <TopNav
          onBack={() => setScreen("home")}
          rightContent={
            <div className="date-pill">
              {groupedHistory.length} SESSIONS
            </div>
          }
        />

        <main className="container history-container">
          <section className="history-header">
            <div>
              <p className="eyebrow">
                TRAINING HISTORY
              </p>

              <h1>
                Previous workouts.
              </h1>

              <p className="subtext">
                Every completed exercise is saved
                in your browser and can be viewed
                later.
              </p>
            </div>
          </section>

          {groupedHistory.length === 0 ? (
            <section className="empty-history">
              <div className="empty-history-icon">
                —
              </div>

              <h2>
                No workouts yet.
              </h2>

              <p>
                Complete your first workout and
                it will appear here.
              </p>

              <button
                type="button"
                className="primary-btn"
                onClick={startSession}
              >
                START FIRST SESSION
              </button>
            </section>
          ) : selectedHistorySession ? (
            <HistoryDetail
              session={selectedHistorySession}
              onBack={() =>
                setSelectedHistorySession(null)
              }
            />
          ) : (
            <div className="history-list">
              {groupedHistory.map(
                (session) => {
                  const uniqueExercises =
                    new Set(
                      session.entries.map(
                        (entry) =>
                          entry.exercise
                      )
                    ).size;

                  const totalVolume =
                    session.entries.reduce(
                      (sum, entry) =>
                        sum +
                        (Number(
                          entry.weight
                        ) || 0) *
                          (Number(
                            entry.reps
                          ) || 0),
                      0
                    );

                  return (
                    <button
                      type="button"
                      className="history-card"
                      key={session.sessionId}
                      onClick={() =>
                        setSelectedHistorySession(
                          session
                        )
                      }
                    >
                      <div className="history-card-date">
                        <span>
                          {formatDate(
                            session.date
                          )}
                        </span>

                        <strong>
                          {session.workout}
                        </strong>
                      </div>

                      <div className="history-card-stats">
                        <div>
                          <span>
                            EXERCISES
                          </span>

                          <strong>
                            {
                              uniqueExercises
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            VOLUME
                          </span>

                          <strong>
                            {Math.round(
                              totalVolume
                            )}{" "}
                            kg
                          </strong>
                        </div>

                        <div className="history-arrow">
                          →
                        </div>
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

  /* =======================================================
     REST
     ======================================================= */

  if (screen === "rest") {
    return (
      <div className="app-shell">
        <TopNav
          onBack={() => setScreen("home")}
        />

        <main className="container narrow complete-screen">
          <div className="complete-mark rest-mark">
            R
          </div>

          <p className="eyebrow">
            SUNDAY
          </p>

          <h1>
            Rest day.
          </h1>

          <p className="subtext">
            Your Push–Pull–Leg split runs Monday
            through Saturday. No workout is
            scheduled today.
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setScreen("home")}
          >
            BACK TO DASHBOARD
          </button>
        </main>
      </div>
    );
  }

  /* =======================================================
     PLAN
     ======================================================= */

  if (screen === "plan") {
    return (
      <div className="app-shell">
        <TopNav
          onBack={cancelSession}
        />

        <main className="container narrow">
          <section className="flow-head">
            <div>
              <p className="eyebrow">
                EXERCISE{" "}
                {exerciseIndex + 1} /{" "}
                {exercises.length}
              </p>

              <h1>
                {workout.label}
              </h1>

              <p className="subtext">
                Start with the first exercise.
                Your programmed sets and reps
                are already filled in.
              </p>
            </div>

            <div className="progress-line">
              {exercises.map(
                (exercise, index) => (
                  <span
                    key={`${exercise.id}-${index}`}
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

          <div className="session-card">
            <div className="exercise-index">
              EXERCISE{" "}
              {String(
                exerciseIndex + 1
              ).padStart(2, "0")}
            </div>

            <h2>
              {currentExercise.name}
            </h2>

            <div className="target-row">
              <div>
                <span>
                  DEFAULT SETS
                </span>

                <strong>
                  {currentExercise.sets}
                </strong>
              </div>

              <div>
                <span>
                  DEFAULT REPS
                </span>

                <strong>
                  {currentExercise.reps}
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

            <div className="session-actions">
              <button
                type="button"
                className="primary-btn full"
                onClick={() =>
                  configureExercise(
                    currentExercise
                  )
                }
              >
                ADD REPS & SETS →
              </button>

              <button
                type="button"
                className="secondary-btn full"
                onClick={
                  continueWithDefault
                }
              >
                CONTINUE WITH DEFAULT
              </button>
            </div>
          </div>

          <section className="queue">
            {exercises.map(
              (exercise, index) => (
                <div
                  key={`${exercise.id}-${index}`}
                  className={`queue-row ${
                    index ===
                    exerciseIndex
                      ? "current"
                      : ""
                  }`}
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <strong>
                    {exercise.name}
                  </strong>

                  <small>
                    {exercise.sets} ×{" "}
                    {exercise.reps}
                  </small>
                </div>
              )
            )}
          </section>
        </main>
      </div>
    );
  }

  /* =======================================================
     EXERCISE
     ======================================================= */

  if (
    screen === "exercise" &&
    activeExercise
  ) {
    return (
      <div className="app-shell">
        <TopNav
          onBack={() =>
            setScreen("plan")
          }
        />

        <main className="container narrow">
          <section className="flow-head">
            <div>
              <p className="eyebrow">
                {activeExercise.started
                  ? "IN PROGRESS"
                  : "READY TO START"}
              </p>

              <h1>
                {activeExercise.name}
              </h1>

              <p className="subtext">
                Change the defaults for this
                session only, then start the
                exercise.
              </p>
            </div>
          </section>

          <p className="default-note">
            Default:{" "}
            {activeExercise.sets} sets ×{" "}
            {activeExercise.reps} reps
          </p>

          <div className="editor-card">
            <Field
              label="NUMBER OF SETS"
              value={
                activeExercise.sets
              }
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    sets: value
                  })
                )
              }
            />

            <Field
              label="REPS PER SET"
              value={
                activeExercise.reps
              }
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    reps: value
                  })
                )
              }
            />

            <Field
              label="WEIGHT (KG)"
              value={
                activeExercise.weight
              }
              placeholder="Enter weight"
              onChange={(value) =>
                setActiveExercise(
                  (current) => ({
                    ...current,
                    weight: value
                  })
                )
              }
            />
          </div>

          {!activeExercise.started ? (
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
                Exercise active
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
                onClick={
                  finishExercise
                }
              >
                {exerciseIndex ===
                exercises.length - 1
                  ? "FINISH WORKOUT"
                  : "DONE — NEXT EXERCISE →"}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  /* =======================================================
     COMPLETE
     ======================================================= */

  if (screen === "complete") {
    return (
      <div className="app-shell">
        <TopNav
          onBack={() => setScreen("home")}
        />

        <main className="container narrow complete-screen">
          <div className="complete-mark">
            ✓
          </div>

          <p className="eyebrow">
            SESSION COMPLETE
          </p>

          <h1>
            Workout logged.
          </h1>

          <p className="subtext">
            Your complete workout has been
            saved to your history.
          </p>

          <div className="complete-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={openHistory}
            >
              VIEW HISTORY
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() =>
                setScreen("home")
              }
            >
              BACK TO DASHBOARD
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

/* =========================================================
   HISTORY DETAIL
   ========================================================= */

function HistoryDetail({
  session,
  onBack
}) {
  const groupedExercises = useMemo(() => {
    const groups = {};

    session.entries.forEach(
      (entry) => {
        if (!groups[entry.exercise]) {
          groups[entry.exercise] = [];
        }

        groups[entry.exercise].push(
          entry
        );
      }
    );

    return Object.entries(groups);
  }, [session]);

  const totalVolume =
    session.entries.reduce(
      (sum, entry) =>
        sum +
        (Number(entry.weight) || 0) *
          (Number(entry.reps) || 0),
      0
    );

  return (
    <section className="history-detail">
      <button
        type="button"
        className="history-back"
        onClick={onBack}
      >
        ← BACK TO HISTORY
      </button>

      <div className="history-detail-heading">
        <div>
          <p className="eyebrow">
            {formatDate(session.date)}
          </p>

          <h2>
            {session.workout}
          </h2>
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
      </div>

      <div className="history-exercises">
        {groupedExercises.map(
          ([exerciseName, entries]) => (
            <div
              className="history-exercise"
              key={exerciseName}
            >
              <div className="history-exercise-title">
                <h3>
                  {exerciseName}
                </h3>

                <span>
                  {entries.length} sets
                </span>
              </div>

              <div className="set-table">
                <div className="set-table-header">
                  <span>SET</span>
                  <span>REPS</span>
                  <span>WEIGHT</span>
                  <span>VOLUME</span>
                </div>

                {entries.map(
                  (entry) => (
                    <div
                      className="set-row"
                      key={entry.id}
                    >
                      <span>
                        {entry.set}
                      </span>

                      <span>
                        {entry.reps}
                      </span>

                      <span>
                        {entry.weight > 0
                          ? `${entry.weight} kg`
                          : "BW"}
                      </span>

                      <span>
                        {entry.weight > 0
                          ? `${entry.weight * entry.reps} kg`
                          : "—"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function StatCard({
  label,
  value,
  suffix
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>

      <strong>
        {value}
        <em>{suffix}</em>
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
      <span>{label}</span>

      <input
        type="number"
        min="0"
        value={value}
        placeholder={placeholder}
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
  onBack,
  rightContent
}) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="back-btn"
        onClick={onBack}
      >
        ← BACK
      </button>

      <div className="brand">
        FORGE<span>.</span>
      </div>

      {rightContent || (
        <div className="top-spacer"></div>
      )}
    </header>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <App />
);