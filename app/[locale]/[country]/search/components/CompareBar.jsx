"use client";

export default function CompareBar({ compareList, removeCompare }) {

  if(compareList.length === 0) return null;

  return (

    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex justify-between items-center">

      <div className="flex gap-3">

        {compareList.map((v)=>(
          <div key={v.id} className="relative">

            <img
              src={v.images?.[0]}
              className="w-16 h-16 rounded-lg object-cover"
            />

            <button
              onClick={()=>removeCompare(v.id)}
              className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full text-xs"
            >
              ×
            </button>

          </div>
        ))}

      </div>

      <div className="flex items-center gap-3">

        <span className="font-semibold text-sm">
          {compareList.length} / 4 selected
        </span>

        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Compare
        </button>

      </div>

    </div>

  );
}