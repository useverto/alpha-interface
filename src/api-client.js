// Simple arweave graphql API client
export async function query({ query, variables = null }) {
  var graphql = JSON.stringify({
    query,
    variables,
  });
  var requestOptions = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: graphql,
  };
  let res = await fetch("https://arweave.dev/graphql", requestOptions);
  return await res.clone().json();
}
