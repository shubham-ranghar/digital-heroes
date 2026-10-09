"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError, FormError } from "@/components/auth/form-message";
import { ScoreChips } from "@/components/scores/score-chips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteScoreAction, saveScoreAction } from "@/lib/scores/actions";
import { formatPlayedOnLabel, todayIsoDate } from "@/lib/scores/dates";
import { SCORE_SLOT_COUNT } from "@/lib/scores/rolling";
import type { ScoreRow } from "@/lib/scores/types";
import { scoreFormSchema } from "@/lib/validations/score";
import { tabularImpact } from "@/lib/typography";
import { cn } from "@/lib/utils";

const HIGHLIGHT_MS = 1600;

type ScoresPanelProps = {
  initialScores: ScoreRow[];
  variant?: "full" | "dashboard";
};

type FormState = {
  scoreId?: string;
  score: string;
  playedOn: string;
};

const emptyForm = (): FormState => ({
  score: "",
  playedOn: todayIsoDate(),
});

export function ScoresPanel({
  initialScores,
  variant = "full",
}: ScoresPanelProps) {
  const isDashboard = variant === "dashboard";
  const [scores, setScores] = useState(initialScores);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<ScoreRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const isEditing = Boolean(form.scoreId);

  useEffect(() => {
    if (!highlightId && !justSaved) {
      return;
    }
    const timer = window.setTimeout(() => {
      setHighlightId(null);
      setJustSaved(false);
    }, HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [highlightId, justSaved]);

  const sortedScores = useMemo(
    () =>
      [...scores].sort((a, b) => b.played_on.localeCompare(a.played_on)),
    [scores],
  );

  function resetForm() {
    setForm(emptyForm());
    setFieldErrors({});
    setFormError(null);
    setDuplicate(null);
  }

  function startEdit(row: ScoreRow) {
    setForm({
      scoreId: row.id,
      score: String(row.score),
      playedOn: row.played_on,
    });
    setFieldErrors({});
    setFormError(null);
    setDuplicate(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setDuplicate(null);

    const clientParsed = scoreFormSchema.safeParse({
      scoreId: form.scoreId,
      score: form.score,
      playedOn: form.playedOn,
    });

    if (!clientParsed.success) {
      const flat = clientParsed.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >;
      setFieldErrors({
        score: flat.score?.[0],
        playedOn: flat.playedOn?.[0],
      });
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await saveScoreAction(clientParsed.data);
      if (result.ok) {
        setScores(result.scores);
        const savedRow = result.scores.find(
          (row) => row.played_on === clientParsed.data.playedOn,
        );
        // Belt and braces: never claim a save the returned list doesn't show.
        if (!savedRow) {
          const message = "Your score wasn't saved. Refresh and try again.";
          toast.error(message);
          setFormError(message);
          return;
        }
        setHighlightId(savedRow.id);
        setJustSaved(true);
        resetForm();
        toast.success(isEditing ? "Score updated." : "Score saved.");
        return;
      }

      toast.error(result.message);
      setFormError(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      if (result.duplicate) {
        setDuplicate(result.duplicate);
      }
    });
  }

  function handleDelete(scoreId: string) {
    startTransition(async () => {
      const result = await deleteScoreAction({ scoreId });
      if (result.ok) {
        setScores(result.scores);
        if (form.scoreId === scoreId) {
          resetForm();
        }
        toast.success("Score removed.");
        return;
      }
      toast.error(result.message);
      setFormError(result.message);
    });
  }

  return (
    <div className={isDashboard ? "space-y-5" : "space-y-8"}>
      <div className="space-y-3">
        <SlotMeter filled={Math.min(sortedScores.length, SCORE_SLOT_COUNT)} />
        <ScoreChips
          scores={sortedScores}
          highlightId={highlightId}
          staggerIn={!isDashboard}
        />
      </div>

      <Card interactive={false} className={isDashboard ? "border-none bg-transparent shadow-none" : undefined}>
        {!isDashboard ? (
          <CardHeader>
            <CardTitle>{isEditing ? "Edit score" : "Log a round"}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={isDashboard ? "p-0" : undefined}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormError message={formError} />

            {duplicate ? (
              <div className="motion-fade-down rounded-xl border border-coral/40 bg-coral/10 px-3 py-3 text-sm text-navy">
                <p>
                  You already have{" "}
                  <span className={tabularImpact}>{duplicate.score}</span> pts on{" "}
                  {formatPlayedOnLabel(duplicate.played_on)}.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => startEdit(duplicate)}
                >
                  Edit that entry
                </Button>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="score" className="text-sm font-medium text-navy">
                  Stableford score
                </label>
                <Input
                  id="score"
                  name="score"
                  type="number"
                  min={1}
                  max={45}
                  inputMode="numeric"
                  placeholder="1–45"
                  value={form.score}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, score: event.target.value }))
                  }
                  aria-invalid={Boolean(fieldErrors.score)}
                  disabled={isPending}
                  required
                />
                <FieldError message={fieldErrors.score} />
              </div>

              <div className="space-y-2">
                <label htmlFor="playedOn" className="text-sm font-medium text-navy">
                  Date played
                </label>
                <Input
                  id="playedOn"
                  name="playedOn"
                  type="date"
                  max={todayIsoDate()}
                  value={form.playedOn}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      playedOn: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(fieldErrors.playedOn)}
                  disabled={isPending}
                  required
                />
                <FieldError message={fieldErrors.playedOn} />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="submit"
                className={cn(
                  "w-full min-w-36 sm:w-auto",
                  justSaved &&
                    !isPending &&
                    "bg-status-active text-cream hover:bg-status-active",
                )}
                loading={isPending}
              >
                {isPending ? (
                  "Saving…"
                ) : justSaved ? (
                  <>
                    <Check className="motion-pop-in" aria-hidden />
                    Saved
                  </>
                ) : isEditing ? (
                  "Update score"
                ) : (
                  "Save score"
                )}
              </Button>
              {isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                  onClick={resetForm}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {!isDashboard ? (
        <Card interactive={false}>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scores yet — your latest five rounds will appear here, newest
                first.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {sortedScores.map((row) => (
                  <li
                    key={row.id}
                    className={cn(
                      "-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 motion-interactive",
                      row.id === highlightId && "bg-coral/8",
                      row.id === form.scoreId && "bg-sand/60",
                    )}
                  >
                    <div className={tabularImpact}>
                      <p className="font-sans text-lg text-navy">
                        {row.score}{" "}
                        <span className="text-sm font-normal text-slate">
                          pts · {formatPlayedOnLabel(row.played_on)}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit score on ${row.played_on}`}
                        onClick={() => startEdit(row)}
                        disabled={isPending}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete score on ${row.played_on}`}
                        onClick={() => handleDelete(row.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4 text-status-danger" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : sortedScores.length > 0 ? (
        <ul className="divide-y divide-line rounded-xl border border-line bg-sand/50">
          {sortedScores.map((row) => (
            <li
              key={row.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 motion-interactive first:rounded-t-xl last:rounded-b-xl",
                row.id === highlightId && "bg-coral/10",
                row.id === form.scoreId && "bg-sand",
              )}
            >
              <div className={tabularImpact}>
                <span className="font-sans text-navy">{row.score}</span>
                <span className="text-sm text-slate">
                  {" "}
                  pts · {formatPlayedOnLabel(row.played_on)}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit score on ${row.played_on}`}
                  onClick={() => startEdit(row)}
                  disabled={isPending}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete score on ${row.played_on}`}
                  onClick={() => handleDelete(row.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4 text-status-danger" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Log your first round above — we keep your latest five scores.
        </p>
      )}
    </div>
  );
}

function SlotMeter({ filled }: { filled: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex flex-1 gap-1"
        role="meter"
        aria-label="Score slots filled"
        aria-valuemin={0}
        aria-valuemax={SCORE_SLOT_COUNT}
        aria-valuenow={filled}
      >
        {Array.from({ length: SCORE_SLOT_COUNT }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-500 ease-[var(--ease-out)]",
              index < filled ? "bg-coral" : "bg-line",
            )}
          />
        ))}
      </div>
      <p className={cn("shrink-0 text-xs text-slate", tabularImpact)}>
        {filled} of {SCORE_SLOT_COUNT} rounds
      </p>
    </div>
  );
}
