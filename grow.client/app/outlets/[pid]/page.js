import Outlets from './outlets'

export default async function OutletsPage({ params }) {

  const res = await fetch(`https://grow.mattdaisley.com:444/outlets/${params.pid}`)
  const data = await res.json()

  return (
    <Outlets data={data} />
  )
}
