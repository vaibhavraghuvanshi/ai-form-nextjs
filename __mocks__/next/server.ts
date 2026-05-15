/**
 * Mock for next/server — provides NextResponse.json() without full Next.js runtime.
 */
class MockNextResponse {
  readonly status: number;
  private _body: string;

  constructor(body: string, init: { status?: number } = {}) {
    this._body = body;
    this.status = init.status ?? 200;
  }

  async json() {
    return JSON.parse(this._body);
  }

  static json(data: unknown, init: { status?: number } = {}) {
    return new MockNextResponse(JSON.stringify(data), init);
  }
}

export const NextResponse = MockNextResponse;
export const NextRequest = class NextRequest extends Request {};
