export interface CourseListParams {
  page: number;
  limit: number;
  keyword?: string;
  categories?: string[];
  isFree?: boolean;
  sortByPrice?: 'ASC' | 'DESC';
  sortByDifficulty?: 'ASC' | 'DESC';
  sortByRating?: 'ASC' | 'DESC';
  sortByTime?: 'ASC' | 'DESC';
  sortByPurchases?: 'ASC' | 'DESC';
}
