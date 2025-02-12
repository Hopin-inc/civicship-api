export function toMembershipsConnection(items: { role: string; communityId: string }[]) {
  return {
    totalCount: items.length,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: items[0]?.communityId ?? null,
      endCursor: items[items.length - 1]?.communityId ?? null,
    },
    edges: items.map((item) => ({
      node: item,
      cursor: item.communityId,
    })),
  };
}
