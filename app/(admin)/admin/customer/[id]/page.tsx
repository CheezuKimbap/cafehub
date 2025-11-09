import CustomerOrders from "@/components/admin/customer/CustomerOrder";

interface PageProps {
  params: Promise<{ id: string }>; // Declare params as a Promise
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // Await the params Promise

  // Now you can use 'id' as a string
  return (
    <div>
      <CustomerOrders customerId={id} />
    </div>
  );
}
