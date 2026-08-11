import sequelize from "../../src/database";
import ListTicketsServiceReport, {
  Params
} from "../../src/services/TicketServices/ListTicketsServiceReport";

jest.mock("../../src/database", () => ({
  __esModule: true,
  default: { query: jest.fn() }
}));

const queryMock = sequelize.query as unknown as jest.Mock;

const baseParams = (overrides: Partial<Params> = {}): Params => ({
  searchParam: "",
  contactId: "",
  whatsappId: [],
  dateFrom: "",
  dateTo: "",
  status: [],
  queueIds: [],
  tags: [],
  users: [],
  userId: "",
  ...overrides
});

// [sqlDaContagem, sqlPaginado]
const capturedSql = (): string[] =>
  queryMock.mock.calls.map(call => call[0] as string);

const capturedReplacements = () =>
  queryMock.mock.calls.map(call => call[1].replacements);

describe("ListTicketsServiceReport", () => {
  beforeEach(() => {
    queryMock.mockReset();
    queryMock.mockResolvedValue([{ total: 0 }]);
  });

  it("passa companyId como parâmetro, não interpolado", async () => {
    await ListTicketsServiceReport(7, baseParams());

    capturedSql().forEach(sql => {
      expect(sql).toContain(":companyId");
      expect(sql).not.toContain("= 7");
    });
    capturedReplacements().forEach(r => expect(r.companyId).toBe(7));
  });

  it("descarta ids não numéricos das listas de filtro", async () => {
    await ListTicketsServiceReport(
      1,
      baseParams({
        queueIds: ["1) or 1=1 --", "2"] as unknown as number[],
        users: ["3"] as unknown as number[]
      })
    );

    const replacements = capturedReplacements()[0];
    expect(replacements.queueIds).toEqual([2]);
    expect(replacements.userIds).toEqual([3]);
    capturedSql().forEach(sql => expect(sql).not.toContain("or 1=1"));
  });

  it("ignora status fora da lista permitida", async () => {
    await ListTicketsServiceReport(
      1,
      baseParams({ status: ["open", "'); drop table \"Tickets\"; --"] })
    );

    const replacements = capturedReplacements()[0];
    expect(replacements.status).toEqual(["open"]);
    capturedSql().forEach(sql => expect(sql).not.toContain("drop table"));
  });

  it("aceita datas no formato esperado e rejeita o resto", async () => {
    await ListTicketsServiceReport(
      1,
      baseParams({ dateFrom: "2024-01-01", dateTo: "' or '1'='1" })
    );

    const replacements = capturedReplacements()[0];
    expect(replacements.dateFrom).toBe("2024-01-01 00:00:00");
    expect(replacements.dateTo).toBeUndefined();
    capturedSql().forEach(sql => expect(sql).not.toContain("'1'='1"));
  });

  it("limita o pageSize e parametriza a paginação", async () => {
    await ListTicketsServiceReport(1, baseParams(), 3, 9999);

    const replacements = capturedReplacements()[1];
    expect(replacements.limit).toBe(200);
    expect(replacements.offset).toBe(400);

    const paginatedSql = capturedSql()[1];
    expect(paginatedSql).toContain("LIMIT :limit OFFSET :offset");
  });

  it("não adiciona filtros quando nada foi informado", async () => {
    await ListTicketsServiceReport(1, baseParams());

    const replacements = capturedReplacements()[0];
    expect(replacements.queueIds).toBeUndefined();
    expect(replacements.status).toBeUndefined();
    expect(replacements.contactIds).toBeUndefined();
  });
});
