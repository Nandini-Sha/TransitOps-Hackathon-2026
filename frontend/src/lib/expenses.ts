export interface Expense {
  id: string;
  vehicleId: string;
  vehicle?: { regNumber: string };
  tripId?: string;
  trip?: { tripCode: string };
  category: "TOLL" | "MISC";
  amount: number;
  date: string;
}

export interface CreateExpenseInput {
  vehicleId: string;
  tripId?: string;
  category: "TOLL" | "MISC";
  amount: number;
  date?: string;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch("/api/expenses", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function createExpense(data: CreateExpenseInput): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
