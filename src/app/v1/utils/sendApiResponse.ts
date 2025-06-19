import { Response } from 'express';

type TLinks = {
  [key: string]: {
    href: string;
    method: string;
  };
};

export type TPagination = {
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
};

type TResponseData<T> = {
  statusCode: number;
  message: string;
  payload: T;
  accessToken?: string;
  links?: TLinks;
  pagination?: TPagination;
};

export const sendApiResponse = <T>(res: Response, data: TResponseData<T>) => {
  const dataResponse: {
    payload: T;
    pagination?: TPagination;
    links?: TLinks;
  } = {
    payload: data.payload,
  };

  if (data.pagination) dataResponse.pagination = data.pagination;
  if (data.links) dataResponse.links = data.links;

  return res.status(data?.statusCode).json({
    success: true,
    statusCode: data?.statusCode,
    message: data?.message,
    accessToken: data.accessToken,
    data: dataResponse,
  });
};
