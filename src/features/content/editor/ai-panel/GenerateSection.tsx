"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { SelectField } from "@/components/ui/SelectField";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { LENGTH_PRESETS, TONE_HINTS, TONE_OPTIONS } from "../constants";
import type { ToneOption } from "../types";
import { AiStepCard } from "./AiStepCard";

type Props = {
  tone: ToneOption;
  topic: string;
  targetLengthInput: string;
  generatePending: boolean;
  onTopicChange: (value: string) => void;
  onToneChange: (value: ToneOption) => void;
  onLengthInputChange: (value: string) => void;
  onLengthInputBlur: () => void;
  onGenerate: () => Promise<void>;
};

export function GenerateSection({
  tone,
  topic,
  targetLengthInput,
  generatePending,
  onTopicChange,
  onToneChange,
  onLengthInputChange,
  onLengthInputBlur,
  onGenerate,
}: Props) {
  const { t } = useI18n();

  return (
    <AiStepCard title={t("editor.generateSection")} animationDelay="320ms">
      <div className="mt-2 grid gap-2">
        <FieldLabel
          text={t("editor.topic")}
          tip={t("editor.topicTip")}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
          buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
        />
        <input
          className="form-control"
          placeholder={t("editor.topicPlaceholder")}
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
        />
        <p className="text-xs text-(--ink-soft)">{t("editor.topicHelp")}</p>

        <FieldLabel
          text={t("editor.tone")}
          tip={t("editor.toneTip")}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
          buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
        />
        <SelectField
          value={tone}
          onChange={(nextValue) => onToneChange(nextValue as ToneOption)}
          options={TONE_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.label),
          }))}
        />
        <p className="text-xs text-(--ink-soft)">{t(TONE_HINTS[tone])}</p>

        <FieldLabel
          text={t("editor.length")}
          tip={t("editor.lengthTip")}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
          buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
        />
        <input
          type="number"
          className="form-control"
          min={120}
          max={1500}
          value={targetLengthInput}
          onChange={(event) => onLengthInputChange(event.target.value)}
          onBlur={onLengthInputBlur}
        />
        <p className="text-xs text-(--ink-soft)">{t("editor.lengthHelp")}</p>
        <div className="flex flex-wrap gap-2">
          {LENGTH_PRESETS.map((preset) => (
            <button
              key={preset.words}
              type="button"
              className="rounded-full border border-(--line) bg-(--bg-surface) px-2 py-1 text-xs text-(--ink) hover:bg-(--bg-soft)"
              onClick={() => onLengthInputChange(String(preset.words))}
            >
              {t(preset.label)} ({preset.words})
            </button>
          ))}
        </div>

        <button
          className="lift-card rounded-lg bg-(--amber) px-3 py-2 font-semibold text-(--teal)"
          disabled={generatePending}
          onClick={onGenerate}
        >
          {generatePending ? (
            <span className="inline-flex items-center gap-2">
              <span className="loading-spinner" aria-hidden="true" />
              {t("editor.generating")}
            </span>
          ) : (
            t("editor.generate")
          )}
        </button>
      </div>
    </AiStepCard>
  );
}
