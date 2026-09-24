import config from '../../../config';

export class AdminApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

const buildQuery = ({ limit, offset, rating, search }) => {
  const query = new URLSearchParams();
  if (limit != null) query.set('limit', limit);
  if (offset != null) query.set('offset', offset);
  if (rating !== '' && rating != null) query.set('rating', rating);
  if (search) query.set('search', search);
  return query.toString();
};

const request = async (path, token) => {
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    headers: { 'X-Admin-Token': token },
  });
  if (!response.ok) {
    throw new AdminApiError('Richiesta admin non riuscita.', response.status);
  }
  return response;
};

export const fetchChatEvaluations = async (token, filters) => {
  const query = buildQuery(filters);
  const response = await request(`/api/admin/chat-interactions?${query}`, token);
  return response.json();
};

export const downloadChatEvaluations = async (token, filters) => {
  const query = buildQuery(filters);
  const response = await request(`/api/admin/chat-interactions/export.csv?${query}`, token);
  return response.blob();
};
