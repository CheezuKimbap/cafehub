import CustomerOrder from "@/components/admin/tables/CustomerOrder";

interface CustomerHistoryPageProps {
  params: { id: string };
}

export default function CustomerHistoryPage({
  params,
}: CustomerHistoryPageProps) {
  const customerId = params.id;

  return (
    <div className="p-4">
      <CustomerOrder customerId={customerId} />
    </div>
  );
}
