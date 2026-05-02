import Layout from '../components/Layout.jsx'

export default function Placeholder({ title = 'Coming Soon' }) {
  return (
    <Layout>
      <h1 className="page-title mb-4">{title}</h1>
      <div className="card p-12 text-center">
        <p className="text-gray-400 text-sm">This section is under development.</p>
      </div>
    </Layout>
  )
}
