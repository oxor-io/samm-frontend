import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FunctionSelectorProps {
  functions: string[];
  onSelect: (fn: string) => void;
}

export default function FunctionSelector({ functions, onSelect }: FunctionSelectorProps) {
  return (
    <Select onValueChange={(value) => onSelect(value)}>
      <SelectTrigger>
        <SelectValue placeholder="Select function" />
      </SelectTrigger>
      <SelectContent>
        {functions.map((fn) => (
          <SelectItem key={fn} value={fn}>
            {fn}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
