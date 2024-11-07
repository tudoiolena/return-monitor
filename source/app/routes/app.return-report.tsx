import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useIndexResourceState,
  TextField,
  Text,
  useSetIndexFiltersMode,
  Page,
  IndexFiltersMode,
  Badge,
  Button,
  Pagination,
} from "@shopify/polaris";
import { SettingsIcon } from "@shopify/polaris-icons";
import { AdminNavigation } from "app/constants/navigation";
import { returnDataLoader } from "app/loaders/returns.loader";
import { useState, useCallback } from "react";

interface Order {
  id: string;
  fullName: string;
  email: string;
  totalOrders: number;
  totalReturns: number;
  returnPercentage: number;
  costOfReturns: number;
}

const ITEMS_PER_PAGE = 10;

export const loader: LoaderFunction = returnDataLoader;

export default function ReportTable() {
  const { orders }: { orders: Order[] } = useLoaderData<typeof loader>();
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const [queryValue, setQueryValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const mappedOrders = orders.map((order) => ({ ...order, id: order.id }));
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(mappedOrders);

  const [fullNameFilter, setFullNameFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");

  const [sortSelected, setSortSelected] = useState<string[]>([
    "returnPercentage desc",
  ]);

  const handleFullNameChange = useCallback(
    (value: string) => setFullNameFilter(value),
    [],
  );

  const handleEmailChange = useCallback(
    (value: string) => setEmailFilter(value),
    [],
  );

  const filters = [
    {
      key: "fullName",
      label: "Customer Name",
      filter: (
        <TextField
          label="Customer Name"
          value={fullNameFilter}
          onChange={handleFullNameChange}
          autoComplete="off"
          labelHidden
        />
      ),
    },
    {
      key: "email",
      label: "Email",
      filter: (
        <TextField
          label="Email"
          value={emailFilter}
          onChange={handleEmailChange}
          autoComplete="off"
          labelHidden
        />
      ),
    },
  ];

  const appliedFilters = [
    ...(fullNameFilter
      ? [
          {
            key: "fullName",
            label: `Customer Name: ${fullNameFilter}`,
            onRemove: () => setFullNameFilter(""),
          },
        ]
      : []),
    ...(emailFilter
      ? [
          {
            key: "email",
            label: `Email: ${emailFilter}`,
            onRemove: () => setEmailFilter(""),
          },
        ]
      : []),
  ];

  const sortOptions = [
    {
      label: "Return Percentage",
      value: "returnPercentage desc" as const,
      directionLabel: "From largest to lowest",
    },
    {
      label: "Return Percentage",
      value: "returnPercentage asc" as const,
      directionLabel: "From lowest to largest",
    },
    {
      label: "Cost of Returns",
      value: "costOfReturns desc" as const,
      directionLabel: "From largest to lowest",
    },
    {
      label: "Cost of Returns",
      value: "costOfReturns asc" as const,
      directionLabel: "From lowest to largest",
    },
    {
      label: "Total Orders",
      value: "totalOrders desc" as const,
      directionLabel: "From largest to lowest",
    },
    {
      label: "Total Orders",
      value: "totalOrders asc" as const,
      directionLabel: "From lowest to largest",
    },
    {
      label: "Total Returns",
      value: "totalReturns desc" as const,
      directionLabel: "From largest to lowest",
    },
    {
      label: "Total Returns",
      value: "totalReturns asc" as const,
      directionLabel: "From lowest to largest",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesFullName =
      !fullNameFilter ||
      order.fullName.toLowerCase().includes(fullNameFilter.toLowerCase());
    const matchesEmail =
      !emailFilter ||
      order.email.toLowerCase().includes(emailFilter.toLowerCase());

    return matchesFullName && matchesEmail;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const [field, direction] = sortSelected[0].split(" ");
    const sortDirection = direction === "asc" ? 1 : -1;

    const aValue = a[field as keyof Order] as number;
    const bValue = b[field as keyof Order] as number;

    return sortDirection * (aValue - bValue);
  });

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const rowMarkup = paginatedOrders.map((order, index) => (
    <IndexTable.Row
      position={index}
      id={order.id}
      key={`${order.id}-${index}`}
      selected={selectedResources.includes(order.id)}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {order.fullName}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{order.totalOrders}</IndexTable.Cell>
      <IndexTable.Cell>{order.totalReturns}</IndexTable.Cell>
      <IndexTable.Cell>
        <Badge
          {...(order.returnPercentage <= 50 &&
            order.returnPercentage > 0 && { tone: "critical" })}
        >
          {order.returnPercentage === 0
            ? "N/A"
            : `${order.returnPercentage.toFixed(2)}%`}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>${order.costOfReturns.toFixed(2)}</IndexTable.Cell>
      <IndexTable.Cell>{order.email}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  const primaryAction = useCallback(
    () => (
      <Button
        onClick={() => navigate(AdminNavigation.reportSettings)}
        variant="secondary"
        icon={SettingsIcon}
      >
        Settings
      </Button>
    ),
    [],
  );

  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <Page primaryAction={primaryAction()}>
      <LegacyCard>
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search orders"
          onQueryChange={(value) => {
            setQueryValue(value);
            handleEmailChange(value);
          }}
          onSort={(sortChoices) => setSortSelected(sortChoices)}
          filters={filters}
          appliedFilters={appliedFilters}
          mode={mode}
          setMode={setMode}
          onClearAll={() => {
            setFullNameFilter("");
            setEmailFilter("");
            setQueryValue("");
          }}
          onQueryClear={() => {
            setQueryValue("");
          }}
          selected={0}
          tabs={[]}
        />
        <IndexTable
          resourceName={{ singular: "order", plural: "orders" }}
          itemCount={sortedOrders.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Name" },
            { title: "Orders" },
            { title: "Returns" },
            { title: "Return percentage" },
            { title: "Cost of returns" },
            { title: "Email" },
          ]}
        >
          {rowMarkup}
        </IndexTable>

        <Pagination
          onPrevious={handlePrevPage}
          onNext={handleNextPage}
          type="table"
          hasNext
          hasPrevious
          label={`${currentPage} of ${totalPages}`}
        />
      </LegacyCard>
    </Page>
  );
}
