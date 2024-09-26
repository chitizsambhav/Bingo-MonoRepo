export async function getData(){

    const res = await fetch('http://localhost:3000/')
    if (!res.ok){
        throw new Error("Fetch did not work")
    }
    const data = await res.json()
    return data.data
}