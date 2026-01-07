export function getMockPagesArray(length: number) {
  const mock_pages = [
    "/mock-pages/page-0.jpg",
    "/mock-pages/page-1.jpg",
    "/mock-pages/page-2.jpg",
    "/mock-pages/page-3.jpg",
    "/mock-pages/page-4.jpg",
  ];

  let array = [];
  for (let i = 0; i < length; i++) {
    array.push(mock_pages[i % 5]);
  }

  return array;
}
