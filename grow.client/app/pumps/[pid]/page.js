import Pumps from './pumps'

export default async function PumpsPage({ params }) {

  // Fetch data from external API
  const res = await fetch(`https://grow.mattdaisley.com:444/pumps/${params.pid}`)
  const data = await res.json()

  return (
    <Pumps data={data} />
  )
}