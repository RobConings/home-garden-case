import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const samplePlants = [
  { name: 'Tomatoes', type: 'Vegetable', area: 4, humidity: '70%' },
  { name: 'Strawberries', type: 'Fruit', area: 3, humidity: '65%' },
  { name: 'Lavender', type: 'Flower', area: 2, humidity: '35%' },
  { name: 'Basil', type: 'Vegetable', area: 1, humidity: '60%' },
];

function CapacityTable() {
  const [selectedPlants, setSelectedPlants] = useState(samplePlants.slice(0, 3));
  const totalArea = 10;
  const usedArea = selectedPlants.reduce((sum, plant) => sum + plant.area, 0);
  const isOverCapacity = usedArea > totalArea;

  return (
    <Card className="w-[720px] p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Garden capacity table</h3>
          <p className="mt-1 text-sm text-slate-600">
            Toggle plants to update table rows and capacity.
          </p>
        </div>
        <Badge variant={isOverCapacity ? 'danger' : 'success'}>
          {isOverCapacity ? 'Over capacity' : 'Within capacity'}
        </Badge>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {samplePlants.map((plant) => {
          const selected = selectedPlants.some((item) => item.name === plant.name);

          return (
            <Button
              key={plant.name}
              size="sm"
              variant={selected ? 'primary' : 'secondary'}
              onClick={() =>
                setSelectedPlants((current) =>
                  selected
                    ? current.filter((item) => item.name !== plant.name)
                    : [...current, plant],
                )
              }
            >
              {plant.name}
            </Button>
          );
        })}
      </div>
      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Space used</span>
          <span className="font-medium text-slate-950">
            {usedArea} / {totalArea}m2
          </span>
        </div>
        <Progress value={usedArea} max={totalArea} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plant</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Humidity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedPlants.map((plant) => (
            <TableRow key={plant.name}>
              <TableCell className="font-medium text-slate-950">{plant.name}</TableCell>
              <TableCell>{plant.type}</TableCell>
              <TableCell>{plant.area}m2</TableCell>
              <TableCell>{plant.humidity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plants: Story = {
  render: () => (
    <Card className="w-[680px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plant</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Humidity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samplePlants.slice(0, 3).map((plant) => (
            <TableRow key={plant.name}>
              <TableCell className="font-medium text-slate-950">{plant.name}</TableCell>
              <TableCell>{plant.type}</TableCell>
              <TableCell>{plant.area}m2</TableCell>
              <TableCell>{plant.humidity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
};

export const InteractiveCapacity: Story = {
  render: () => <CapacityTable />,
};
