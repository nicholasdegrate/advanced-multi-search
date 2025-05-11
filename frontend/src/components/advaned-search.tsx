import { DatePickerWithPresets } from "@/components/date-picker-with-preset";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const operatorOptions = {
  string: ["contains", "equals", "startsWith", "endsWith"],
  select: ["in", "not in"],
  date: ["on", "before", "after", "between"],
  boolean: ["is"],
};

const CONNECTOR = {
  AND: "AND",
  OR: "OR",
} as const;

type FieldType = "string" | "select" | "date" | "boolean";
export interface RelationRecord {
  label: string;
  value: string;
  type: FieldType;
  operator?: string;
  connector?: (typeof CONNECTOR)[keyof typeof CONNECTOR];
  options?: string[];
}

type RelationRecordState = Partial<
  Pick<RelationRecord, "value" | "type" | "operator" | "connector"> & {
    field: string;
  }
>;

interface AdvancedSearchProps {
  relations: Record<string, RelationRecord[]>;
}

export function AdvancedSearch({ relations }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<RelationRecordState[]>([
    {
      field: "customer.fullName",
      type: "string",
      operator: "contains",
    },
  ]);

  const fields = useMemo(() => {
    return Object.values(relations).flat();
  }, [relations]);

  const addFilter = useCallback(() => {
    setFilters((prev) => [
      ...prev,
      {
        connector: CONNECTOR.AND,
      },
    ]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateFilter = useCallback(
    (index: number, value: string, key: keyof RelationRecord) => {
      setFilters((prev) => {
        return prev.map((item, i) => {
          const fieldType = fields.find((field) => field.value === value);
          if (i === index && item.type !== fieldType?.type) {
            const operator = fieldType?.type
              ? { operator: operatorOptions[fieldType?.type][0] }
              : {};

            return {
              ...item,
              ...operator,
              type: fieldType?.type,
              [key]: value,
            };
          }

          if (i === index) {
            return { ...item, [key]: value };
          }
          return item;
        });
      });
    },
    [fields],
  );

  return (
    <div className="flex flex-col items-start gap-2 w-full max-w-2xl">
      {filters.map((f, idx) => {
        const selectedField = fields.find((field) => field.value === f.field);

        const operator = selectedField
          ? operatorOptions[selectedField.type] || []
          : [];
        return (
          <div
            key={idx}
            className={cn(
              `flex flex-row items-center gap-2 w-full`,
              idx > 0 && idx === 1 && "border-t border-t-border pt-2",
            )}
          >
            {idx > 0 && (
              <Select
                defaultValue={CONNECTOR.AND}
                value={f.connector}
                onValueChange={(value) => updateFilter(idx, value, "connector")}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONNECTOR.AND}>AND</SelectItem>
                  <SelectItem value={CONNECTOR.OR}>OR</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select
              value={f.field}
              onValueChange={(value) => {
                updateFilter(idx, value, "field");
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fields" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field, index) => (
                  <SelectItem key={index} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={f.operator}
              onValueChange={(value) => {
                updateFilter(idx, value, "operator");
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {operator.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedField?.type === "string" || !selectedField?.type ? (
              <Input placeholder="Filter info..." className="max-w-sm" />
            ) : null}
            {selectedField?.type === "date" ? (
              <>
                {f.operator === "between" ? (
                  <DatePickerWithRange />
                ) : (
                  <DatePickerWithPresets />
                )}
              </>
            ) : null}

            {selectedField?.type === "boolean" ? (
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="True/False" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            ) : null}

            {selectedField?.type === "select" ? (
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Fields" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field, index) => (
                    <SelectItem key={index} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            {idx == 0 && filters.length < 3 && (
              <Button
                size="icon"
                variant="secondary"
                className="white hover:white transition-colors"
                onClick={addFilter}
              >
                <Plus size={20} />
              </Button>
            )}
            {idx == 0 && (
              <Button
                size="default"
                className="white hover:white transition-colors"
              >
                Search
              </Button>
            )}

            {idx > 0 && (
              <button
                className="text-gray-500 hover:text-gray-600 transition-colors"
                onClick={() => removeFilter(idx)}
              >
                <X size={20} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
