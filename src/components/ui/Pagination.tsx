import { PaginationInfo } from "@/types/type";
import React from "react";
import { Pagination } from "antd";

type PageProps = {
  pageprops: PaginationInfo;
  totablPgae: number;
  onChangePage: (page: number, size: number) => void;
};

export function PageFilter({ pageprops, totablPgae, onChangePage }: PageProps) {
  return (
    <>
      <Pagination
        showSizeChanger={false}
        current={pageprops.pageNumber}
        total={totablPgae}
        pageSize={pageprops.pageSize}
        onChange={onChangePage}
      />
      <br />
    </>
  );
}
