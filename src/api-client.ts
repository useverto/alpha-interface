// Simple arweave graphql API client
export async function query({ query, variables = null }) {
  const graphql = JSON.stringify({
    query,
    variables,
  });
  const requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: graphql,
  };
  const res = await fetch("https://arweave.dev/graphql", requestOptions);
  return await res.clone().json();
}
