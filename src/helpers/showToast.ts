export const showToast = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any,
  title: string,
  description?: string,
  variant = 'default'
) => {
  toast({ title, description, variant });
};
