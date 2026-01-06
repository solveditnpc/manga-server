import SearchPage from "./SearchClient";
import { Suspense } from "react";

export default () => (
  <Suspense fallback={null}>
    <SearchPage />
  </Suspense>
);
