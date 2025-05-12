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
  string: [
    { label: "contains with", value: "contains" },
    { label: "is equals to", value: "equals" },
    { label: "starts with", value: "startsWith" },
    { label: "ends with", value: "endsWith" },
  ],
  select: [
    { label: "in", value: "in" },
    { label: "not in", value: "notIn" },
  ],
  date: [
    { label: "on", value: "on" },
    { label: "before", value: "before" },
    { label: "after", value: "after" },
    { label: "between", value: "between" },
  ],
  boolean: [{ label: "that is", value: "is" }],
};

const CONNECTOR = {
  AND: "AND",
  OR: "OR",
} as const;

type FieldType = "string" | "select" | "date" | "boolean";

type Opt = { label: string; value: string };

type RelationRecordOptions = {
  loading?: boolean;
  defaultValue?: string;
  placeholder?: string;
  data: Opt[];
};

export interface RelationRecord {
  label: string;
  value: string;
  type: FieldType;
  operator?: string;
  connector?: (typeof CONNECTOR)[keyof typeof CONNECTOR];
  options?: RelationRecordOptions;
}

export type RelationRecordState = Partial<
  Pick<
    RelationRecord,
    "value" | "type" | "operator" | "connector" | "options"
  > & {
    field: string;
  }
>;

/**
 * Props for the AdvancedSearch component.
 *
 * @param defaultFilter - An optional default filter applied when the component is loaded.
 * @param onSearch - A callback function triggered when the user applies a search.
 * @param relations - The list of available filters (grouped by category).
 * @param maxJoins - The maximum number of filters (joins) the user can add.
 */
interface AdvancedSearchProps {
  defaultFilterValue?: Pick<RelationRecordState, "operator" | "field">;
  onSearch: (filters: RelationRecordState[]) => void;
  relations: Record<string, RelationRecord[]>;
  maxJoins?: number;
}

type InputType =
  | string
  | React.ChangeEvent<HTMLSelectElement>
  | React.ChangeEvent<HTMLInputElement>
  | string[];

/**
 * AdvancedSearch component for rendering a dynamic search form with filters.
 * Users can add filters, choose fields, operators, and values, and combine them with logical connectors (AND/OR).
 *
 * @param relations - The available fields and filter options for the search.
 * @param defaultFilter - An optional default filter that will be pre-selected when the component loads.
 * @param onSearch - A callback function that is triggered when the user applies the search.
 * @param maxJoins - The maximum number of filters the user can add to the search. Default is 3.
 *
 * @example
 * <AdvancedSearch
 *   relations={{ customer: [{ label: "Full Name", value: "fullName", type: "string" }] }}
 *   onSearch={(filters) => console.log(filters)}
 * />
 */
export function AdvancedSearch({
  relations,
  defaultFilterValue = undefined,
  onSearch,
  maxJoins = 3,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<RelationRecordState[]>(() =>[
    defaultFilterValue ? defaultFilterValue : {},
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
    return () => {
      setFilters((prev) => prev.filter((_, i) => i !== index));
    };
  }, []);

  const updateFilter = useCallback(
    (index: number, key: keyof RelationRecordState) => {
      return (value: InputType) => {
        value = getFormData(value);

        setFilters((prev) => {
          return prev.map((item, i) => {
            const fieldType = fields.find((field) => field.value === value);
            if (i === index && item.type !== fieldType?.type) {
              const operator = fieldType?.type
                ? { operator: operatorOptions[fieldType?.type][0].value }
                : {};

              return {
                ...item,
                ...operator,
                [key]: value,
              };
            }

            if (i === index) {
              return { ...item, [key]: value };
            }
            return item;
          });
        });
      };
    },
    [fields],
  );

  const handleOnSearch = useCallback(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  return (
    <div className="flex flex-col items-start gap-2 w-full max-w-2xl">
      {filters.map((f, idx) => {
        const selectedField = fields.find((field) => field.value === f.field);

        const operator = selectedField
          ? operatorOptions[selectedField.type] || []
          : [];
        
        const betweenValue = f.operator === "between" && f.value ? JSON.parse(f.value) : undefined; 

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
                onValueChange={updateFilter(idx, "connector")}
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
              value={f.field || ""}
              onValueChange={updateFilter(idx, "field")}
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
              value={f.operator || ""}
              onValueChange={updateFilter(idx, "operator")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {operator.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedField?.type === "string" || !selectedField?.type ? (
              <Input
                placeholder="Filter info..."
                className="max-w-sm"
                value={f.value || ""}
                onChange={updateFilter(idx, "value")}
              />
            ) : null}
            {selectedField?.type === "select" ? (
              <Select
                value={f.value || ""}
                onValueChange={updateFilter(idx, "value")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={
                      selectedField?.options?.loading ? "Loading..." : selectedField?.options?.placeholder || "Fields"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(selectedField?.options?.data || []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {selectedField?.type === "date" ? (
              <>
                {f.operator === "between" ? (
                  <DatePickerWithRange
                    value={betweenValue ? { from: betweenValue["form"], to: betweenValue["to"] } : undefined}
                    onChange={(date) => {
                      if (!date) {
                        return;
                      }

                      updateFilter(idx, "value")(JSON.stringify(date));
                    }}
                  />
                ) : (
                    <DatePickerWithPresets
                      value={f.value ? new Date(f.value) : undefined}
                      onChange={(date) => {
                        if (!date) {
                          return;
                        }

                        updateFilter(idx, "value")(date?.toISOString());
                      }}
                    />
                )}
              </>
            ) : null}
            {idx == 0 && filters.length < maxJoins && (
              <Button
                size="icon"
                variant="secondary"
                className="white hover:white transition-colors"
                onClick={addFilter}
              >
                <Plus size={20} />
              </Button>
            )}
            {idx === 0 && (
              <Button
                size="default"
                className="white hover:white transition-colors"
                onClick={handleOnSearch}
              >
                Search
              </Button>
            )}
            {idx > 0 && (
              <button
                className="text-gray-500 hover:text-gray-600 transition-colors"
                onClick={removeFilter(idx)}
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

function getFormData(e: InputType) {
  if (typeof e === "object" && "target" in e && "value" in e.target) {
    return e.target.value;
  }

  if (Array.isArray(e)) {
    return e.join(",");
  }

  return e;
}
