import EditComponent from "@/app/admin/setting/page-component/edit/[slug]/component/EditComponent.jsx"

const page = async ({ params }) => {
  const awaitedParams = await params;

  return (
    <>

      <EditComponent params={awaitedParams} />
    </>
  )
}

export default page;
export const dynamic = 'force-dynamic'
