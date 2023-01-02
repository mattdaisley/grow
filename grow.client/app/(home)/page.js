import HomeComponent from './home';

export default async function HomePage() {

  const pumpsRes = await fetch(`https://grow.mattdaisley.com:444/pumps`)
  const pumps = await pumpsRes.json()

  const sensorsRes = await fetch(`https://grow.mattdaisley.com:444/sensors`)
  const sensors = await sensorsRes.json()

  const outletsRes = await fetch(`https://grow.mattdaisley.com:444/outlets`)
  const outlets = await outletsRes.json()

  return (
    <HomeComponent pumps={pumps} sensors={sensors} outlets={outlets} />
  )
}
