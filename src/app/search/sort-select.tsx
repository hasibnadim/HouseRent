"use client";

export function SortSelect({
  value,
  hidden,
}: {
  value: string;
  hidden: { name: string; value: string }[];
}) {
  return (
    <form className="browse-sort" action="/search" method="get">
      {hidden.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}
      <label>
        Sort by
        <select name="sort" defaultValue={value} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
          <option value="newest">Newest first</option>
          <option value="rent-asc">Rent: low to high</option>
          <option value="rent-desc">Rent: high to low</option>
        </select>
      </label>
    </form>
  );
}
