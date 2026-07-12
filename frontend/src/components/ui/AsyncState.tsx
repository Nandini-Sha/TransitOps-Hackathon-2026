export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-500">{label}</div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-red-500">{message}</div>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 text-center text-slate-500">
        {message}
      </td>
    </tr>
  );
}
