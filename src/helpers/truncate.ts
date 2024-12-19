export function truncateText(input: string, frontChars: number, backChars: number) {
  if (input.length <= frontChars + backChars) {
    return input;
  }
  return `${input.substring(0, frontChars)}...${input.substring(input.length - backChars)}`;
}

export function truncateAddress(address: string) {
  return truncateText(address, 6, 4);
}
