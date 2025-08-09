import Link from "next/link";

type StoreCardProps = {
  id: string;
  name: string;
};

export default function StoreCard({ id, name }: StoreCardProps) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="h-36 bg-gray-100" />
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <div className="mt-3">
          <Link
            href={`/stores/${id}`}
            className="inline-block rounded-md bg-black text-white text-sm px-3 py-2 hover:bg-gray-900"
          >
            Ver tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
