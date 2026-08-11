/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam: string;
  contactId: string;
  whatsappId: string[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  tags: number[];
  users: number[];
  userId: string;
}

// Listas de ids são coagidas a inteiros para nunca virarem SQL.
const toIntList = (value: unknown): number[] => {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  return raw
    .map(item => String(item).trim())
    // Sem o descarte de vazios, Number("") viraria 0 e criaria um filtro falso.
    .filter(item => item.length > 0)
    .map(Number)
    .filter(item => Number.isInteger(item));
};

const VALID_STATUS = ["open", "closed", "pending", "group"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const safePageSize = Number.isInteger(Number(pageSize))
    ? Math.min(Math.max(Number(pageSize), 1), 200)
    : 20;
  const safePage = Number.isInteger(Number(page))
    ? Math.max(Number(page), 1)
    : 1;
  const offset = (safePage - 1) * safePageSize;

  const replacements: Record<string, unknown> = {
    companyId: Number(companyId),
    limit: safePageSize,
    offset
  };

  const query = `
  select
	  t.id,
	  w."name" as "whatsappName",
    c."name" as "contactName",
	  u."name" as "userName",
	  q."name" as "queueName",
	  t."lastMessage",
    t.uuid,
    case t.status
      when 'open' then 'ABERTO'
      when 'closed' then 'FECHADO'
      when 'pending' then 'PENDENTE'
      when 'group' then 'GRUPO'
    end as "status",
    TO_CHAR(t."createdAt", 'DD/MM/YYYY HH24:MI') as "createdAt",
    TO_CHAR(tt."finishedAt", 'DD/MM/YYYY HH24:MI') as "closedAt"
  from "Tickets" t
   LEFT JOIN (
        SELECT DISTINCT ON ("ticketId") *
        FROM "TicketTraking"
        WHERE "companyId" = :companyId
        ORDER BY "ticketId", "id" DESC
    ) tt ON t.id = tt."ticketId"
    inner join "Contacts" c on
      t."contactId" = c.id
    left join "Whatsapps" w on
      t."whatsappId" = w.id
    left join "Users" u on
      t."userId" = u.id
    left join "Queues" q on
      t."queueId" = q.id
  -- filterPeriod`;

  let where = `where t."companyId" = :companyId`;

  if (_.has(params, "dateFrom") && DATE_PATTERN.test(params.dateFrom ?? "")) {
    where += ` and t."createdAt" >= :dateFrom`;
    replacements.dateFrom = `${params.dateFrom} 00:00:00`;
  }

  if (_.has(params, "dateTo") && DATE_PATTERN.test(params.dateTo ?? "")) {
    where += ` and t."createdAt" <= :dateTo`;
    replacements.dateTo = `${params.dateTo} 23:59:59`;
  }

  const whatsappIds = toIntList(params.whatsappId);
  if (whatsappIds.length > 0) {
    where += ` and t."whatsappId" in (:whatsappIds)`;
    replacements.whatsappIds = whatsappIds;
  }

  const userIds = toIntList(params.users);
  if (userIds.length > 0) {
    where += ` and t."userId" in (:userIds)`;
    replacements.userIds = userIds;
  }

  const queueIds = toIntList(params.queueIds);
  if (queueIds.length > 0) {
    where += ` and COALESCE(t."queueId",0) in (:queueIds)`;
    replacements.queueIds = queueIds;
  }

  const status = (params.status ?? []).filter(item =>
    VALID_STATUS.includes(item)
  );
  if (status.length > 0) {
    where += ` and t."status" in (:status)`;
    replacements.status = status;
  }

  const contactIds = toIntList(params.contactId);
  if (contactIds.length > 0) {
    where += ` and t."contactId" in (:contactIds)`;
    replacements.contactIds = contactIds;
  }

  const finalQuery = query.replace("-- filterPeriod", where);

  const totalTicketsQuery = `
    SELECT COUNT(*) as total FROM "Tickets" t
    ${where}  `;

  const totalTicketsResult = await sequelize.query(totalTicketsQuery, {
    replacements,
    type: QueryTypes.SELECT
  });
  const totalTickets = totalTicketsResult[0];

  const paginatedQuery = `${finalQuery} ORDER BY t."createdAt" DESC LIMIT :limit OFFSET :offset`;

  const responseData: any[] = await sequelize.query(paginatedQuery, {
    replacements,
    type: QueryTypes.SELECT
  });

  return { tickets: responseData, totalTickets };
}
