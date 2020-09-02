// Simple arweave graphql API client
export default async function query({ query, variables = null }) {
  const
    graphql = JSON.stringify({
      query,
      variables
    }),
    requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: graphql,
    };
  let res = await fetch("https://arweave.dev/graphql", requestOptions);
  return await res.clone().json();
}
