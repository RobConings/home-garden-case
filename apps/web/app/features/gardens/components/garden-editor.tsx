import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Eraser,
  MousePointer2,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react';
import { EditorLayout, PageContainer, PageRow, PageStack } from '@/components/layout';
import { PageTitle, Panel } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { Garden } from '@/features/gardens/api';
import { useMessages } from '@/providers/message-provider';

type KonvaModule = typeof import('react-konva');

export type EditorShapeType = 'blocking_building' | 'pathway' | 'grass' | 'plant_area';

export type GardenPoint = {
  x: number;
  y: number;
};

export type GardenEditorShape = {
  id: string;
  persistedId?: number;
  type: EditorShapeType;
  points: GardenPoint[];
};

export type GardenEditorLoaderData = {
  garden: Garden;
  shapes: GardenEditorShape[];
};

export type GardenEditorActionData = {
  message: string;
  type: 'success' | 'error';
  shapes?: GardenEditorShape[];
};

type SelectedPoint = {
  shapeId: string;
  pointIndex: number;
};

type CanvasSize = {
  width: number;
  height: number;
};

type CanvasTheme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

const defaultCanvasSize = {
  width: 920,
  height: 620,
};
const canvasPadding = 56;

const shapeOptions: Array<{
  value: EditorShapeType;
  label: string;
  fill: string;
  stroke: string;
}> = [
  {
    value: 'plant_area',
    label: 'Plant area',
    fill: 'rgba(38, 120, 58, 0.24)',
    stroke: '#26783A',
  },
  {
    value: 'pathway',
    label: 'Pathway',
    fill: 'rgba(138, 90, 59, 0.22)',
    stroke: '#8A5A3B',
  },
  {
    value: 'grass',
    label: 'Grass',
    fill: 'rgba(143, 220, 102, 0.22)',
    stroke: '#5B9B37',
  },
  {
    value: 'blocking_building',
    label: 'Blocking building',
    fill: 'rgba(107, 114, 128, 0.28)',
    stroke: '#6B7280',
  },
];

export function GardenEditor({ garden }: { garden: Garden }) {
  const { shapes: initialShapes } = useLoaderData<GardenEditorLoaderData>();
  const saveFetcher = useFetcher<GardenEditorActionData>();
  const { showError, showSuccess } = useMessages();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [konva, setKonva] = useState<KonvaModule | null>(null);
  const [activeType, setActiveType] = useState<EditorShapeType>('plant_area');
  const [draftPoints, setDraftPoints] = useState<GardenPoint[]>([]);
  const [shapes, setShapes] = useState<GardenEditorShape[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(defaultCanvasSize);
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>(getCanvasTheme);
  const metrics = useMemo(() => createEditorMetrics(garden, canvasSize), [canvasSize, garden]);
  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
  const isSaving = saveFetcher.state !== 'idle';

  useEffect(() => {
    let isMounted = true;

    import('react-konva').then((module) => {
      if (isMounted) {
        setKonva(module);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const updateCanvasSize = () => {
      const rect = board.getBoundingClientRect();
      setCanvasSize({
        width: Math.max(520, Math.round(rect.width)),
        height: Math.max(460, Math.round(rect.height)),
      });
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(board);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const updateTheme = () => setCanvasTheme(getCanvasTheme());
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!saveFetcher.data) {
      return;
    }

    if (saveFetcher.data.type === 'success') {
      if (saveFetcher.data.shapes) {
        setShapes(saveFetcher.data.shapes);
      }

      showSuccess(saveFetcher.data.message);
      return;
    }

    showError(saveFetcher.data.message);
  }, [saveFetcher.data, showError, showSuccess]);

  function addDraftPoint(point: GardenPoint) {
    setDraftPoints((currentPoints) => [...currentPoints, point]);
    setSelectedShapeId(null);
    setSelectedPoint(null);
  }

  function finishShape() {
    if (draftPoints.length < 3) {
      return;
    }

    const id = createShapeId();
    setShapes((currentShapes) => [
      ...currentShapes,
      {
        id,
        type: activeType,
        points: draftPoints,
      },
    ]);
    setDraftPoints([]);
    setSelectedShapeId(id);
    setSelectedPoint(null);
  }

  function removeSelectedShape() {
    if (!selectedShapeId) {
      return;
    }

    setShapes((currentShapes) =>
      currentShapes.filter((shape) => shape.id !== selectedShapeId),
    );
    setSelectedShapeId(null);
    setSelectedPoint(null);
  }

  function selectShape(shapeId: string | null) {
    setSelectedShapeId(shapeId);
    setSelectedPoint(null);
  }

  function selectPoint(shapeId: string, pointIndex: number) {
    setSelectedShapeId(shapeId);
    setSelectedPoint({ shapeId, pointIndex });
  }

  function movePoint(shapeId: string, pointIndex: number, point: GardenPoint) {
    setShapes((currentShapes) =>
      currentShapes.map((shape) =>
        shape.id === shapeId
          ? {
              ...shape,
              points: shape.points.map((currentPoint, currentIndex) =>
                currentIndex === pointIndex ? point : currentPoint,
              ),
            }
          : shape,
      ),
    );
  }

  function deleteSelectedPoint() {
    if (!selectedPoint) {
      return;
    }

    const shape = shapes.find((currentShape) => currentShape.id === selectedPoint.shapeId);

    setShapes((currentShapes) =>
      currentShapes.flatMap((shape) => {
        if (shape.id !== selectedPoint.shapeId) {
          return [shape];
        }

        if (shape.points.length <= 3) {
          return [];
        }

        return [
          {
            ...shape,
            points: shape.points.filter((_, index) => index !== selectedPoint.pointIndex),
          },
        ];
      }),
    );
    setSelectedShapeId(shape && shape.points.length > 3 ? selectedPoint.shapeId : null);
    setSelectedPoint(null);
  }

  function saveShapes() {
    const formData = new FormData();
    formData.set('shapes', JSON.stringify(shapes));
    saveFetcher.submit(formData, { method: 'post' });
  }

  return (
    <PageContainer minHeight="content" className="max-w-none py-8">
      <PageStack gap="lg">
        <PageTitle
          eyebrow="Garden editor"
          title={garden.gardenName}
          description={`${formatSize(garden.totalWidth)} x ${formatSize(
            garden.totalHeight,
          )} m drawing grid, ${garden.gridSizeCm} cm spacing`}
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard/gardens">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Gardens
              </Link>
            </Button>
          }
        />

        <EditorLayout
          controls={
            <>
              <Panel title="Tools">
                <label className="grid gap-2 text-sm font-medium text-[var(--rootly-text)]">
                  Type
                  <Select
                    value={activeType}
                    onChange={(event) => setActiveType(event.target.value as EditorShapeType)}
                  >
                    {shapeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={saveShapes}
                    disabled={isSaving || draftPoints.length > 0}
                  >
                    <Save aria-hidden="true" className="h-4 w-4" />
                    {isSaving ? 'Saving' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    onClick={finishShape}
                    disabled={draftPoints.length < 3}
                    variant="secondary"
                  >
                    <Check aria-hidden="true" className="h-4 w-4" />
                    Finish
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDraftPoints((points) => points.slice(0, -1))}
                    disabled={draftPoints.length === 0}
                  >
                    <Undo2 aria-hidden="true" className="h-4 w-4" />
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDraftPoints([])}
                    disabled={draftPoints.length === 0}
                  >
                    <Eraser aria-hidden="true" className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </Panel>

              <Panel
                title="Selection"
                contentClassName="gap-3 text-sm text-[var(--rootly-text-muted)]"
              >
                {selectedShape ? (
                  <>
                    <p className="font-medium text-[var(--rootly-text)]">
                      {getShapeOption(selectedShape.type).label}
                    </p>
                    <p>{selectedShape.points.length} straight-line points</p>
                    <p>
                      {selectedPoint
                        ? `Point ${selectedPoint.pointIndex + 1} selected.`
                        : 'Click a point to move or delete it.'}
                    </p>
                    <PageRow gap="sm">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={removeSelectedShape}
                        disabled={!selectedShapeId}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Shape
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={deleteSelectedPoint}
                        disabled={!selectedPoint}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Point
                      </Button>
                    </PageRow>
                  </>
                ) : (
                  <PageRow align="start" gap="sm">
                    <MousePointer2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rootly-text-muted)]"
                    />
                    <p>Select a drawn shape to inspect, move points, or delete it.</p>
                  </PageRow>
                )}
              </Panel>

              <Panel title="Legend" contentClassName="gap-3">
                {shapeOptions.map((option) => (
                  <PageRow key={option.value} align="center" gap="sm">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: option.fill, borderColor: option.stroke }}
                    />
                    <span className="text-sm text-[var(--rootly-text-muted)]">{option.label}</span>
                  </PageRow>
                ))}
              </Panel>
            </>
          }
          board={
            <Card>
              <CardHeader className="border-b border-[var(--rootly-border)]">
                <PageRow align="between" gap="sm">
                  <CardTitle>Drawing board</CardTitle>
                  <div className="text-sm text-[var(--rootly-text-muted)]">
                    {draftPoints.length > 0
                      ? `${draftPoints.length} points`
                      : 'Click grid to draw'}
                  </div>
                </PageRow>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={boardRef}
                  className="h-[calc(100vh-22rem)] min-h-[520px] w-full bg-[var(--rootly-background)]"
                >
                  {konva ? (
                    <GardenCanvas
                      konva={konva}
                      metrics={metrics}
                      theme={canvasTheme}
                      shapes={shapes}
                      draftPoints={draftPoints}
                      activeType={activeType}
                      selectedShapeId={selectedShapeId}
                      selectedPoint={selectedPoint}
                      onAddPoint={addDraftPoint}
                      onSelectShape={selectShape}
                      onSelectPoint={selectPoint}
                      onMovePoint={movePoint}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-[var(--rootly-text-muted)]">
                      Loading editor
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          }
        />
      </PageStack>
    </PageContainer>
  );
}

function GardenCanvas({
  konva,
  metrics,
  theme,
  shapes,
  draftPoints,
  activeType,
  selectedShapeId,
  selectedPoint,
  onAddPoint,
  onSelectShape,
  onSelectPoint,
  onMovePoint,
}: {
  konva: KonvaModule;
  metrics: EditorMetrics;
  theme: CanvasTheme;
  shapes: GardenEditorShape[];
  draftPoints: GardenPoint[];
  activeType: EditorShapeType;
  selectedShapeId: string | null;
  selectedPoint: SelectedPoint | null;
  onAddPoint: (point: GardenPoint) => void;
  onSelectShape: (id: string | null) => void;
  onSelectPoint: (shapeId: string, pointIndex: number) => void;
  onMovePoint: (shapeId: string, pointIndex: number, point: GardenPoint) => void;
}) {
  const { Stage, Layer, Rect, Line, Circle, Text } = konva;

  function handleStageClick(event: { target: unknown; currentTarget: unknown }) {
    if (event.target !== event.currentTarget) {
      return;
    }

    const stage = event.currentTarget as {
      getPointerPosition: () => { x: number; y: number } | null;
    };
    const pointer = stage.getPointerPosition();

    if (!pointer || !isInsideGarden(pointer, metrics)) {
      onSelectShape(null);
      return;
    }

    onAddPoint(toGardenPoint(pointer, metrics));
  }

  return (
    <Stage width={metrics.canvasWidth} height={metrics.canvasHeight} onMouseDown={handleStageClick}>
      <Layer>
        <Rect
          x={0}
          y={0}
          width={metrics.canvasWidth}
          height={metrics.canvasHeight}
          fill={theme.background}
          listening={false}
        />
        <GardenGrid konva={konva} metrics={metrics} theme={theme} />
        <Rect
          x={metrics.originX}
          y={metrics.originY}
          width={metrics.gardenWidthPx}
          height={metrics.gardenHeightPx}
          stroke={theme.text}
          strokeWidth={2}
          fill={withAlpha(theme.surface, 0.72)}
          listening={false}
        />

        {shapes.map((shape) => {
          const option = getShapeOption(shape.type);
          const isSelected = shape.id === selectedShapeId;

          return (
            <Line
              key={shape.id}
              points={toCanvasLinePoints(shape.points, metrics)}
              closed
              fill={option.fill}
              stroke={option.stroke}
              strokeWidth={isSelected ? 4 : 2}
              lineJoin="round"
              onMouseDown={(event: { cancelBubble: boolean }) => {
                event.cancelBubble = true;
                onSelectShape(shape.id);
              }}
            />
          );
        })}

        {shapes
          .filter((shape) => shape.id === selectedShapeId)
          .flatMap((shape) =>
            shape.points.map((point, pointIndex) => {
              const canvasPoint = toCanvasPoint(point, metrics);
              const isSelectedPoint =
                selectedPoint?.shapeId === shape.id && selectedPoint.pointIndex === pointIndex;

              return (
                <Circle
                  key={`${shape.id}-${pointIndex}`}
                  x={canvasPoint.x}
                  y={canvasPoint.y}
                  radius={isSelectedPoint ? 7 : 6}
                  fill={isSelectedPoint ? '#E97828' : theme.surface}
                  stroke={getShapeOption(shape.type).stroke}
                  strokeWidth={3}
                  draggable
                  dragBoundFunc={(position: { x: number; y: number }) =>
                    toCanvasPoint(
                      clampGardenPoint(toGardenPoint(position, metrics), metrics),
                      metrics,
                    )
                  }
                  onMouseDown={(event: { cancelBubble: boolean }) => {
                    event.cancelBubble = true;
                    onSelectPoint(shape.id, pointIndex);
                  }}
                  onDragMove={(event: { target: { x: () => number; y: () => number } }) => {
                    const boundedPoint = clampGardenPoint(
                      toGardenPoint({ x: event.target.x(), y: event.target.y() }, metrics),
                      metrics,
                    );
                    onMovePoint(shape.id, pointIndex, boundedPoint);
                  }}
                  onDragEnd={(event: {
                    target: {
                      x: (value?: number) => number;
                      y: (value?: number) => number;
                    };
                  }) => {
                    const latestShape = shapes.find((currentShape) => currentShape.id === shape.id);
                    const latestPoint = latestShape?.points[pointIndex];

                    if (!latestPoint) {
                      return;
                    }

                    const canvasLatestPoint = toCanvasPoint(latestPoint, metrics);
                    event.target.x(canvasLatestPoint.x);
                    event.target.y(canvasLatestPoint.y);
                  }}
                />
              );
            }),
          )}

        {draftPoints.length > 0 ? (
          <>
            <Line
              points={toCanvasLinePoints(draftPoints, metrics)}
              stroke={getShapeOption(activeType).stroke}
              strokeWidth={2}
              dash={[8, 6]}
              lineJoin="round"
            />
            {draftPoints.map((point, index) => {
              const canvasPoint = toCanvasPoint(point, metrics);

              return (
                <Circle
                  key={`${point.x}-${point.y}-${index}`}
                  x={canvasPoint.x}
                  y={canvasPoint.y}
                  radius={5}
                  fill="#26783A"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              );
            })}
          </>
        ) : null}

        <Text
          x={metrics.originX}
          y={metrics.originY + metrics.gardenHeightPx + 14}
          text={`${formatSize(metrics.widthMeters)} m`}
          fontSize={13}
          fill={theme.muted}
          listening={false}
        />
        <Text
          x={metrics.originX + metrics.gardenWidthPx + 12}
          y={metrics.originY}
          text={`${formatSize(metrics.heightMeters)} m`}
          fontSize={13}
          fill={theme.muted}
          rotation={90}
          listening={false}
        />
      </Layer>
    </Stage>
  );
}

function GardenGrid({
  konva,
  metrics,
  theme,
}: {
  konva: KonvaModule;
  metrics: EditorMetrics;
  theme: CanvasTheme;
}) {
  const { Line } = konva;
  const lines = [];
  const step = metrics.gridStepMeters;

  for (let x = 0; x <= metrics.widthMeters; x += step) {
    const canvasX = metrics.originX + x * metrics.scale;
    lines.push(
      <Line
        key={`x-${x}`}
        points={[canvasX, metrics.originY, canvasX, metrics.originY + metrics.gardenHeightPx]}
        stroke={theme.border}
        strokeWidth={1}
        listening={false}
      />,
    );
  }

  for (let y = 0; y <= metrics.heightMeters; y += step) {
    const canvasY = metrics.originY + y * metrics.scale;
    lines.push(
      <Line
        key={`y-${y}`}
        points={[metrics.originX, canvasY, metrics.originX + metrics.gardenWidthPx, canvasY]}
        stroke={theme.border}
        strokeWidth={1}
        listening={false}
      />,
    );
  }

  return <>{lines}</>;
}

type EditorMetrics = {
  canvasWidth: number;
  canvasHeight: number;
  widthMeters: number;
  heightMeters: number;
  gridStepMeters: number;
  scale: number;
  originX: number;
  originY: number;
  gardenWidthPx: number;
  gardenHeightPx: number;
};

function createEditorMetrics(garden: Garden, canvasSize: CanvasSize): EditorMetrics {
  const widthMeters = Math.max(garden.totalWidth, 1);
  const heightMeters = Math.max(garden.totalHeight, 1);
  const gridStepMeters = Math.max((garden.gridSizeCm || 25) / 100, 0.05);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const scale = Math.min(
    (canvasWidth - canvasPadding * 2) / widthMeters,
    (canvasHeight - canvasPadding * 2) / heightMeters,
  );
  const gardenWidthPx = widthMeters * scale;
  const gardenHeightPx = heightMeters * scale;

  return {
    canvasWidth,
    canvasHeight,
    widthMeters,
    heightMeters,
    gridStepMeters,
    scale,
    originX: (canvasWidth - gardenWidthPx) / 2,
    originY: (canvasHeight - gardenHeightPx) / 2,
    gardenWidthPx,
    gardenHeightPx,
  };
}

function isInsideGarden(point: { x: number; y: number }, metrics: EditorMetrics) {
  return (
    point.x >= metrics.originX &&
    point.x <= metrics.originX + metrics.gardenWidthPx &&
    point.y >= metrics.originY &&
    point.y <= metrics.originY + metrics.gardenHeightPx
  );
}

function toGardenPoint(point: { x: number; y: number }, metrics: EditorMetrics): GardenPoint {
  return {
    x: roundToGrid((point.x - metrics.originX) / metrics.scale, metrics.gridStepMeters),
    y: roundToGrid((point.y - metrics.originY) / metrics.scale, metrics.gridStepMeters),
  };
}

function clampGardenPoint(point: GardenPoint, metrics: EditorMetrics): GardenPoint {
  return {
    x: Math.min(metrics.widthMeters, Math.max(0, point.x)),
    y: Math.min(metrics.heightMeters, Math.max(0, point.y)),
  };
}

function toCanvasPoint(point: GardenPoint, metrics: EditorMetrics) {
  return {
    x: metrics.originX + point.x * metrics.scale,
    y: metrics.originY + point.y * metrics.scale,
  };
}

function toCanvasLinePoints(points: GardenPoint[], metrics: EditorMetrics) {
  return points.flatMap((point) => {
    const canvasPoint = toCanvasPoint(point, metrics);
    return [canvasPoint.x, canvasPoint.y];
  });
}

function roundToGrid(value: number, step: number) {
  return Math.round(value / step) * step;
}

function getCanvasTheme(): CanvasTheme {
  if (typeof window === 'undefined') {
    return {
      background: '#FAF8F3',
      surface: '#FFFFFF',
      text: '#182019',
      muted: '#5D665F',
      border: 'rgba(24, 32, 25, 0.26)',
    };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const background = readCssColor(styles, '--rootly-background', '#FAF8F3');
  const surface = readCssColor(styles, '--rootly-surface', '#FFFFFF');
  const text = readCssColor(styles, '--rootly-text', '#182019');
  const muted = readCssColor(styles, '--rootly-text-muted', '#5D665F');

  return {
    background,
    surface,
    text,
    muted,
    border: withAlpha(text, isDarkColor(background) ? 0.22 : 0.26),
  };
}

function readCssColor(styles: CSSStyleDeclaration, name: string, fallback: string) {
  return styles.getPropertyValue(name).trim() || fallback;
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const normalized =
      color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
    const red = Number.parseInt(normalized.slice(1, 3), 16);
    const green = Number.parseInt(normalized.slice(3, 5), 16);
    const blue = Number.parseInt(normalized.slice(5, 7), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  return color;
}

function isDarkColor(color: string) {
  if (!color.startsWith('#') || color.length !== 7) {
    return false;
  }

  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance < 0.5;
}

function getShapeOption(type: EditorShapeType) {
  return shapeOptions.find((option) => option.value === type) ?? shapeOptions[0];
}

function createShapeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `shape-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function formatSize(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
