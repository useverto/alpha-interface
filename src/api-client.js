export async function query(query) {
    var graphql = JSON.stringify({
        query,
        variables: {},
    });
    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
    };
    let res = await fetch("https://arweave.dev/graphql", requestOptions);
    console.log(await res.clone().text())
    return await res.clone().json();
}