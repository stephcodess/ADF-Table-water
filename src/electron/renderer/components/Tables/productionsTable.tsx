import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, VStack } from "@chakra-ui/react";

// Define the interfaces for the production data
interface ProductionEntry {
  machine: string;
  operator: string;
  quantity: number;
  kg_used: number;
  packing_bags_used: number;
}

interface Production {
  id: string;
  data: ProductionEntry[];
  date: { toDate: () => Date };
}

interface ProductionTablesProps {
  productions: Production[];
}

const ProductionTables: React.FC<ProductionTablesProps> = ({ productions }) => {
  // Flatten the data to get individual production entries with their respective machine
  const flattenedProductions = productions.flatMap((production) =>
    production.data?.map((entry) => ({
      ...entry,
      date: production.date,
      id: production.id,
    }))
  );

  // Group the productions by machine
  const groupedProductions = flattenedProductions.reduce(
    (acc, production) => {
      const { machine } = production;
      if (!acc[machine]) {
        acc[machine] = [];
      }
      acc[machine].push(production);
      return acc;
    },
    {} as Record<
      string,
      (ProductionEntry & { date: { toDate: () => Date }; id: string })[]
    >
  );

  return (
    <VStack spacing={8}>
      {Object.keys(groupedProductions).map((machine) => (
        <Table
          variant="simple"
          key={machine}
          id={`productions-table-${machine}`}
        >
          <Thead>
            <Tr>
              <Th
                colSpan={5}
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "1.2em",
                }}
              >
                DAILY PRODUCTION RECORD fOR {machine}
              </Th>
            </Tr>
            <Tr>
              <Th>Date</Th>
              <Th>Operator</Th>
              <Th>Quantity</Th>
              <Th>Kg Used</Th>
              {/* <Th>Packing Bags Used</Th> */}
            </Tr>
          </Thead>
          <Tbody>
            {groupedProductions[machine].map((production) => (
              <Tr key={production.id}>
                <Td>
                  {new Date(production.date.toDate()).toLocaleDateString()}
                </Td>
                <Td>{production.operator}</Td>
                <Td>{production.quantity}</Td>
                <Td>{production.kg_used}</Td>
                {/* <Td>{production.packing_bags_used}</Td> */}
              </Tr>
            ))}
          </Tbody>
        </Table>
      ))}
    </VStack>
  );
};

export default ProductionTables;
