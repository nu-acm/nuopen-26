import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cn } from '@/lib/utils';
export function ToggleGroup({
  className,
  variant = 'default',
  ...props
}: Omit<ToggleGroupPrimitive.Props, 'className'> & {
  className?: string;
  variant?: 'default' | 'columns';
}) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(variant === 'columns' ? 'whd-column-group' : 'whd-segmented', className)}
      {...props}
    />
  );
}
export function ToggleGroupItem({
  className,
  variant = 'default',
  ...props
}: Omit<TogglePrimitive.Props, 'className'> & {
  className?: string;
  variant?: 'default' | 'columns';
}) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(variant === 'columns' ? 'whd-column-toggle' : 'whd-toggle', className)}
      {...props}
    />
  );
}
