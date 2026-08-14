import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ArrowLeft,
  Check,
  Eraser,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Monitor,
  MousePointer2,
  Plus,
  RotateCcw,
  Save,
  Sprout,
  Sun,
  Trash2,
  Undo2,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import type { Garden } from '@/features/gardens/api';
import type { PlantLibraryEntry } from '@/features/plants/api';
import { cn } from '@/lib/utils';
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

export type PlacedPlant = {
  id: string;
  persistedId?: number;
  plantLibraryId: number;
  size: PlantSize;
  x: number;
  y: number;
};

export type GardenEditorLoaderData = {
  garden: Garden;
  plantLibrary: PlantLibraryEntry[];
  plants: PlacedPlant[];
  shapes: GardenEditorShape[];
};

export type GardenEditorActionData = {
  message: string;
  type: 'success' | 'error';
  shapes?: GardenEditorShape[];
  plants?: PlacedPlant[];
};

type SelectedPoint = {
  shapeId: string;
  pointIndex: number;
};

type EditorMode = 'create' | 'select' | 'plant';
export type PlantSize = 1 | 2 | 3;

type CanvasSize = {
  width: number;
  height: number;
};

type PanelPosition = {
  x: number;
  y: number;
};

type PanelDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
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
  const {
    shapes: initialShapes,
    plants: initialPlants,
    plantLibrary,
  } = useLoaderData<GardenEditorLoaderData>();
  const saveFetcher = useFetcher<GardenEditorActionData>();
  const { showError, showSuccess } = useMessages();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const actionsPanelRef = useRef<HTMLDivElement | null>(null);
  const actionsPanelDragRef = useRef<PanelDragState | null>(null);
  const [konva, setKonva] = useState<KonvaModule | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [activeType, setActiveType] = useState<EditorShapeType>('plant_area');
  const [draftPoints, setDraftPoints] = useState<GardenPoint[]>([]);
  const [shapes, setShapes] = useState<GardenEditorShape[]>(initialShapes);
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>(initialPlants);
  const [selectedPlantLibraryId, setSelectedPlantLibraryId] = useState(
    plantLibrary[0]?.plantLibraryId ?? 0,
  );
  const [selectedPlantSize, setSelectedPlantSize] = useState<PlantSize>(1);
  const [selectedPlacedPlantId, setSelectedPlacedPlantId] = useState<string | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);
  const [sunTime, setSunTime] = useState(12);
  const [showSun, setShowSun] = useState(true);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(defaultCanvasSize);
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>(getCanvasTheme);
  const [actionsPanelPosition, setActionsPanelPosition] = useState<PanelPosition | null>(null);
  const [isActionsPanelMoved, setIsActionsPanelMoved] = useState(false);
  const [isActionsPanelCompact, setIsActionsPanelCompact] = useState(false);
  const metrics = useMemo(() => createEditorMetrics(garden, canvasSize), [canvasSize, garden]);
  const selectedPlantLibraryEntry = getPlantLibraryEntry(plantLibrary, selectedPlantLibraryId);
  const selectedPlacedPlant = placedPlants.find((plant) => plant.id === selectedPlacedPlantId);
  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);
  const isSaving = saveFetcher.state !== 'idle';
  const actionTextClassName = isActionsPanelCompact ? 'hidden' : 'hidden 2xl:inline';
  const compactDetailsClassName = isActionsPanelCompact ? 'sr-only' : undefined;

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
    const panel = actionsPanelRef.current;

    if (!panel || isActionsPanelMoved) {
      return;
    }

    setActionsPanelPosition(getDefaultActionsPanelPosition(canvasSize, panel));
  }, [canvasSize, isActionsPanelMoved]);

  useEffect(() => {
    const panel = actionsPanelRef.current;

    if (!panel) {
      return;
    }

    setActionsPanelPosition((currentPosition) =>
      currentPosition ? clampPanelPosition(currentPosition, canvasSize, panel) : currentPosition,
    );
  }, [canvasSize, isActionsPanelCompact]);

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

      if (saveFetcher.data.plants) {
        setPlacedPlants(saveFetcher.data.plants);
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
    setSelectedPlacedPlantId(null);
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
    setEditorMode('select');
  }

  function removeSelectedShape() {
    if (!selectedShapeId) {
      return;
    }

    setShapes((currentShapes) => currentShapes.filter((shape) => shape.id !== selectedShapeId));
    setSelectedShapeId(null);
    setSelectedPoint(null);
    setSelectedPlacedPlantId(null);
  }

  function selectShape(shapeId: string | null) {
    setSelectedShapeId(shapeId);
    setSelectedPoint(null);
    setSelectedPlacedPlantId(null);
  }

  function selectPoint(shapeId: string, pointIndex: number) {
    setSelectedShapeId(shapeId);
    setSelectedPoint({ shapeId, pointIndex });
    setSelectedPlacedPlantId(null);
  }

  function changeEditorMode(mode: EditorMode) {
    setEditorMode(mode);

    if (mode === 'create') {
      setSelectedShapeId(null);
      setSelectedPoint(null);
      setSelectedPlacedPlantId(null);
    }
  }

  function placePlant(point: GardenPoint) {
    if (!selectedPlantLibraryEntry) {
      showError('Choose a plant from the library first.');
      return;
    }

    const plant = {
      id: createShapeId(),
      plantLibraryId: selectedPlantLibraryEntry.plantLibraryId,
      size: selectedPlantSize,
      x: point.x,
      y: point.y,
    };

    if (!isPlantPlacementInsideGarden(plant, metrics)) {
      showError('That plant size does not fit inside the garden.');
      return;
    }

    if (!isPlantFootprintInsidePlantArea(plant, shapes, metrics)) {
      showError('Plants can only be placed inside plant areas.');
      return;
    }

    if (doesPlantFootprintOverlap(plant, placedPlants, metrics)) {
      showError('That plant grid space overlaps another plant.');
      return;
    }

    setPlacedPlants((currentPlants) => [...currentPlants, plant]);
    setSelectedPlacedPlantId(plant.id);
    setSelectedShapeId(null);
    setSelectedPoint(null);
  }

  function selectPlacedPlant(plantId: string) {
    setSelectedPlacedPlantId(plantId);
    setSelectedShapeId(null);
    setSelectedPoint(null);
    setEditorMode('plant');
  }

  function removeSelectedPlacedPlant() {
    if (!selectedPlacedPlantId) {
      return;
    }

    setPlacedPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== selectedPlacedPlantId),
    );
    setSelectedPlacedPlantId(null);
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

  function movePlant(plantId: string, point: GardenPoint) {
    const plant = placedPlants.find((currentPlant) => currentPlant.id === plantId);

    if (!plant) {
      return false;
    }

    const nextPlant = {
      ...plant,
      ...point,
    };

    if (
      !isPlantPlacementInsideGarden(nextPlant, metrics) ||
      !isPlantFootprintInsidePlantArea(nextPlant, shapes, metrics) ||
      doesPlantFootprintOverlap(nextPlant, placedPlants, metrics, plantId)
    ) {
      showError('That plant grid space is already occupied or outside a plant area.');
      return false;
    }

    setPlacedPlants((currentPlants) =>
      currentPlants.map((currentPlant) => (currentPlant.id === plantId ? nextPlant : currentPlant)),
    );
    return true;
  }

  function saveShapes() {
    const formData = new FormData();
    formData.set('shapes', JSON.stringify(shapes));
    formData.set('plants', JSON.stringify(placedPlants));
    saveFetcher.submit(formData, { method: 'post' });
  }

  function startActionsPanelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const position =
      actionsPanelPosition ?? getDefaultActionsPanelPosition(canvasSize, actionsPanelRef.current);

    actionsPanelDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setActionsPanelPosition(position);
    setIsActionsPanelMoved(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveActionsPanel(event: ReactPointerEvent<HTMLButtonElement>) {
    const dragState = actionsPanelDragRef.current;
    const panel = actionsPanelRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setActionsPanelPosition(
      clampPanelPosition(
        {
          x: dragState.originX + event.clientX - dragState.startX,
          y: dragState.originY + event.clientY - dragState.startY,
        },
        canvasSize,
        panel,
      ),
    );
  }

  function stopActionsPanelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (actionsPanelDragRef.current?.pointerId === event.pointerId) {
      actionsPanelDragRef.current = null;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function resetActionsPanelPosition() {
    setIsActionsPanelMoved(false);
    setActionsPanelPosition(getDefaultActionsPanelPosition(canvasSize, actionsPanelRef.current));
  }

  return (
    <PageContainer
      minHeight="content"
      className="box-border flex min-h-[calc(100vh-64px)] max-w-none flex-col gap-4 py-4 xl:h-[calc(100vh-64px)] xl:overflow-hidden"
    >
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-(--rootly-primary)">
            Garden editor
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold text-(--rootly-text)">
            {garden.gardenName}
          </h1>
          <p className="mt-1 text-sm text-(--rootly-text-muted)">
            {formatSize(garden.totalWidth)} x {formatSize(garden.totalHeight)} m drawing grid,{' '}
            {garden.gridSizeCm} cm spacing
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/dashboard/gardens">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Gardens
          </Link>
        </Button>
      </div>

      <Card className="xl:hidden">
        <CardContent className="grid gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-(--rootly-primary-soft) text-(--rootly-primary)">
            <Monitor aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-(--rootly-text)">
              Editor available on larger screens
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--rootly-text-muted)">
              Use a desktop or a wider browser window to draw garden zones and place plants.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/dashboard/gardens">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Gardens
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hidden min-h-0 flex-1 flex-col overflow-hidden xl:flex">
        <CardHeader className="border-b border-(--rootly-border) p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <CardTitle>Drawing board</CardTitle>
              <p className="mt-1 text-sm text-(--rootly-text-muted)">
                {editorMode === 'create'
                  ? draftPoints.length > 0
                    ? `${draftPoints.length} draft points`
                    : 'Click grid to draw'
                  : editorMode === 'plant'
                    ? 'Place plants inside plant areas'
                    : 'Select and adjust existing shapes'}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <div
                aria-label="Shape type"
                className="flex flex-wrap gap-2 rounded-md border border-(--rootly-border) bg-(--rootly-surface-muted) p-1"
              >
                {shapeOptions.map((option) => {
                  const isActive = option.value === activeType;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveType(option.value)}
                      className={cn(
                        'inline-flex h-9 items-center gap-2 rounded px-3 text-sm font-medium text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)',
                        isActive && 'bg-(--rootly-surface) text-(--rootly-text) shadow-sm',
                      )}
                      aria-pressed={isActive}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 rounded border"
                        style={{ backgroundColor: option.fill, borderColor: option.stroke }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button
                  type="button"
                  onClick={saveShapes}
                  disabled={isSaving || draftPoints.length > 0}
                >
                  <Save aria-hidden="true" className="h-4 w-4" />
                  {isSaving ? 'Saving' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 p-0">
          <div
            ref={boardRef}
            className="relative min-h-0 flex-1 overflow-hidden bg-(--rootly-background)"
          >
            {konva ? (
              <GardenCanvas
                konva={konva}
                metrics={metrics}
                theme={canvasTheme}
                editorMode={editorMode}
                sunDirection={garden.sunDirection}
                sunTime={sunTime}
                shapes={shapes}
                placedPlants={placedPlants}
                draftPoints={draftPoints}
                activeType={activeType}
                showSun={showSun}
                selectedPlacedPlantId={selectedPlacedPlantId}
                selectedShapeId={selectedShapeId}
                selectedPoint={selectedPoint}
                onSunTimeChange={setSunTime}
                onAddPoint={addDraftPoint}
                onPlacePlant={placePlant}
                onSelectPlacedPlant={selectPlacedPlant}
                onSelectShape={selectShape}
                onSelectPoint={selectPoint}
                onMovePoint={movePoint}
                onMovePlant={movePlant}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-(--rootly-text-muted)">
                Loading editor
              </div>
            )}

            <div className="pointer-events-none absolute left-4 top-4 grid gap-2 rounded-md border border-(--rootly-border) bg-(--rootly-surface)/95 p-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase text-(--rootly-text)">Legend</p>
              {shapeOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded border"
                    style={{ backgroundColor: option.fill, borderColor: option.stroke }}
                  />
                  <span className="text-xs font-medium text-(--rootly-text-muted)">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              ref={actionsPanelRef}
              className={cn(
                'absolute grid gap-3 rounded-md border border-(--rootly-border) bg-(--rootly-surface)/95 p-3 shadow-sm backdrop-blur',
                isActionsPanelCompact
                  ? 'w-[min(12rem,calc(100%-2rem))]'
                  : 'w-[min(19rem,calc(100%-2rem))] 2xl:w-[24rem] 2xl:p-4',
                actionsPanelPosition ? null : 'right-4 top-4',
              )}
              style={
                actionsPanelPosition
                  ? {
                      left: actionsPanelPosition.x,
                      top: actionsPanelPosition.y,
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Move actions panel"
                  title="Move actions panel"
                  onPointerDown={startActionsPanelDrag}
                  onPointerMove={moveActionsPanel}
                  onPointerUp={stopActionsPanelDrag}
                  onPointerCancel={stopActionsPanelDrag}
                  className="inline-flex h-8 flex-1 cursor-move items-center justify-center rounded border border-(--rootly-border) bg-(--rootly-surface-muted) text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)"
                >
                  <GripHorizontal aria-hidden="true" className="h-4 w-4" />
                </button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="Reset actions panel position"
                  title="Reset actions panel position"
                  onClick={resetActionsPanelPosition}
                  className="h-8 w-8"
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label={
                    isActionsPanelCompact
                      ? 'Expand actions panel text'
                      : 'Minimize actions panel text'
                  }
                  title={
                    isActionsPanelCompact
                      ? 'Expand actions panel text'
                      : 'Minimize actions panel text'
                  }
                  onClick={() => setIsActionsPanelCompact((isCompact) => !isCompact)}
                  className="h-8 w-8"
                >
                  {isActionsPanelCompact ? (
                    <Maximize2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Minimize2 aria-hidden="true" className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div
                aria-label="Editor mode"
                className="grid grid-cols-3 gap-1 rounded-md border border-(--rootly-border) bg-(--rootly-surface-muted) p-1"
              >
                <button
                  type="button"
                  onClick={() => changeEditorMode('create')}
                  className={cn(
                    'inline-flex h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)',
                    editorMode === 'create' &&
                      'bg-(--rootly-surface) text-(--rootly-text) shadow-sm',
                  )}
                  aria-pressed={editorMode === 'create'}
                  aria-label="Create shape mode"
                  title="Create"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  <span className={actionTextClassName}>Create</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeEditorMode('select')}
                  className={cn(
                    'inline-flex h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)',
                    editorMode === 'select' &&
                      'bg-(--rootly-surface) text-(--rootly-text) shadow-sm',
                  )}
                  aria-pressed={editorMode === 'select'}
                  aria-label="Select mode"
                  title="Select"
                >
                  <MousePointer2 aria-hidden="true" className="h-4 w-4" />
                  <span className={actionTextClassName}>Select</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeEditorMode('plant')}
                  className={cn(
                    'inline-flex h-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)',
                    editorMode === 'plant' &&
                      'bg-(--rootly-surface) text-(--rootly-text) shadow-sm',
                  )}
                  aria-pressed={editorMode === 'plant'}
                  aria-label="Plant mode"
                  title="Plant"
                >
                  <Sprout aria-hidden="true" className="h-4 w-4" />
                  <span className={actionTextClassName}>Plant</span>
                </button>
              </div>

              {editorMode === 'create' ? (
                <>
                  <div className={compactDetailsClassName}>
                    <p className="text-sm font-semibold text-(--rootly-text)">
                      Drawing {getShapeOption(activeType).label.toLowerCase()}
                    </p>
                    <p className="mt-1 text-xs text-(--rootly-text-muted)">
                      {draftPoints.length >= 3
                        ? `${draftPoints.length} points ready`
                        : `${Math.max(3 - draftPoints.length, 0)} more point${
                            3 - draftPoints.length === 1 ? '' : 's'
                          } needed`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={finishShape}
                      disabled={draftPoints.length < 3}
                      aria-label="Complete shape"
                      title="Complete shape"
                    >
                      <Check aria-hidden="true" className="h-4 w-4" />
                      <span className={actionTextClassName}>Complete shape</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setDraftPoints((points) => points.slice(0, -1))}
                      disabled={draftPoints.length === 0}
                      aria-label="Undo point"
                      title="Undo point"
                    >
                      <Undo2 aria-hidden="true" className="h-4 w-4" />
                      <span className={actionTextClassName}>Undo point</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setDraftPoints([])}
                      disabled={draftPoints.length === 0}
                      aria-label="Clear draft"
                      title="Clear draft"
                    >
                      <Eraser aria-hidden="true" className="h-4 w-4" />
                      <span className={actionTextClassName}>Clear draft</span>
                    </Button>
                  </div>
                </>
              ) : editorMode === 'plant' ? (
                <>
                  <div className="grid gap-2">
                    <label
                      className={cn(
                        'text-sm font-semibold text-(--rootly-text)',
                        compactDetailsClassName,
                      )}
                    >
                      Plant from library
                      <Select
                        value={String(selectedPlantLibraryId)}
                        onChange={(event) => setSelectedPlantLibraryId(Number(event.target.value))}
                        className="mt-2"
                        disabled={plantLibrary.length === 0}
                      >
                        {plantLibrary.map((plant) => (
                          <option key={plant.plantLibraryId} value={plant.plantLibraryId}>
                            {plant.commonName}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <p
                      className={cn('text-xs text-(--rootly-text-muted)', compactDetailsClassName)}
                    >
                      {selectedPlantLibraryEntry
                        ? `${selectedPlantSize} x ${selectedPlantSize} grid ${
                            selectedPlantSize === 1 ? 'cell' : 'cells'
                          }`
                        : 'No plants available'}
                    </p>
                    <div
                      aria-label="Plant size"
                      className="grid grid-cols-3 gap-1 rounded-md border border-(--rootly-border) bg-(--rootly-surface-muted) p-1"
                    >
                      {[1, 2, 3].map((size) => {
                        const plantSize = size as PlantSize;
                        const isActive = selectedPlantSize === plantSize;

                        return (
                          <button
                            key={plantSize}
                            type="button"
                            onClick={() => setSelectedPlantSize(plantSize)}
                            className={cn(
                              'inline-flex h-8 items-center justify-center rounded px-2 text-sm font-medium text-(--rootly-text-muted) transition-colors hover:bg-(--rootly-surface) hover:text-(--rootly-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--rootly-primary)',
                              isActive && 'bg-(--rootly-surface) text-(--rootly-text) shadow-sm',
                            )}
                            aria-pressed={isActive}
                          >
                            {plantSize}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {selectedPlacedPlant ? (
                    <div className="grid gap-2 border-t border-(--rootly-border) pt-3">
                      <p
                        className={cn(
                          'text-sm font-semibold text-(--rootly-text)',
                          compactDetailsClassName,
                        )}
                      >
                        {getPlacedPlantName(selectedPlacedPlant, plantLibrary)}
                      </p>
                      <p
                        className={cn(
                          'text-xs text-(--rootly-text-muted)',
                          compactDetailsClassName,
                        )}
                      >
                        {formatPoint(selectedPlacedPlant)}, {selectedPlacedPlant.size} x{' '}
                        {selectedPlacedPlant.size}
                      </p>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={removeSelectedPlacedPlant}
                        aria-label="Remove selected plant"
                        title="Remove selected plant"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        <span className={actionTextClassName}>Plant</span>
                      </Button>
                    </div>
                  ) : (
                    <p
                      className={cn('text-sm text-(--rootly-text-muted)', compactDetailsClassName)}
                    >
                      Click inside a plant area to place a plant.
                    </p>
                  )}
                </>
              ) : selectedShape ? (
                <>
                  <div className={compactDetailsClassName}>
                    <p className="text-sm font-semibold text-(--rootly-text)">
                      {getShapeOption(selectedShape.type).label}
                    </p>
                    <p className="mt-1 text-xs text-(--rootly-text-muted)">
                      {selectedPoint
                        ? `Point ${selectedPoint.pointIndex + 1} of ${
                            selectedShape.points.length
                          } selected`
                        : `${selectedShape.points.length} points. Drag points to adjust.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={removeSelectedShape}
                      disabled={!selectedShapeId}
                      aria-label="Remove selected shape"
                      title="Remove selected shape"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      <span className={actionTextClassName}>Shape</span>
                    </Button>
                  </div>
                </>
              ) : (
                <p className={cn('text-sm text-(--rootly-text-muted)', compactDetailsClassName)}>
                  {draftPoints.length > 0
                    ? 'Draft paused. Switch to Create to continue it.'
                    : 'Select a shape or point to adjust it.'}
                </p>
              )}

              <div className="grid gap-2 border-t border-(--rootly-border) pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-(--rootly-text)">
                    <Sun aria-hidden="true" className="h-4 w-4 text-(--rootly-accent)" />
                    <span className={compactDetailsClassName}>Sun</span>
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium text-(--rootly-text-muted)',
                      compactDetailsClassName,
                    )}
                  >
                    {formatSunTime(sunTime)}
                  </span>
                </div>
                <label
                  className={cn(
                    'flex items-center justify-between gap-3 text-sm font-medium text-(--rootly-text)',
                    compactDetailsClassName,
                  )}
                >
                  <span>Show sun</span>
                  <input
                    type="checkbox"
                    checked={showSun}
                    onChange={(event) => setShowSun(event.target.checked)}
                    className="h-4 w-4 accent-(--rootly-accent)"
                  />
                </label>
                <input
                  type="range"
                  min={6}
                  max={18}
                  step={0.5}
                  value={sunTime}
                  onChange={(event) => setSunTime(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-(--rootly-accent)"
                  aria-label="Time of day"
                />
                <div
                  className={cn(
                    'flex justify-between text-[11px] font-medium text-(--rootly-text-muted)',
                    compactDetailsClassName,
                  )}
                >
                  <span>Morning</span>
                  <span>{getDirectionLabel(garden.sunDirection)} exposure</span>
                  <span>Evening</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function GardenCanvas({
  konva,
  metrics,
  theme,
  editorMode,
  sunDirection,
  sunTime,
  shapes,
  placedPlants,
  draftPoints,
  activeType,
  showSun,
  selectedPlacedPlantId,
  selectedShapeId,
  selectedPoint,
  onSunTimeChange,
  onAddPoint,
  onPlacePlant,
  onSelectPlacedPlant,
  onSelectShape,
  onSelectPoint,
  onMovePoint,
  onMovePlant,
}: {
  konva: KonvaModule;
  metrics: EditorMetrics;
  theme: CanvasTheme;
  editorMode: EditorMode;
  sunDirection: Garden['sunDirection'];
  sunTime: number;
  shapes: GardenEditorShape[];
  placedPlants: PlacedPlant[];
  draftPoints: GardenPoint[];
  activeType: EditorShapeType;
  showSun: boolean;
  selectedPlacedPlantId: string | null;
  selectedShapeId: string | null;
  selectedPoint: SelectedPoint | null;
  onSunTimeChange: (time: number) => void;
  onAddPoint: (point: GardenPoint) => void;
  onPlacePlant: (point: GardenPoint) => void;
  onSelectPlacedPlant: (plantId: string) => void;
  onSelectShape: (id: string | null) => void;
  onSelectPoint: (shapeId: string, pointIndex: number) => void;
  onMovePoint: (shapeId: string, pointIndex: number, point: GardenPoint) => void;
  onMovePlant: (plantId: string, point: GardenPoint) => boolean;
}) {
  const { Stage, Layer, Rect, Line, Circle, Text, Group } = konva;
  const sunVisualization = getSunVisualization(metrics, sunDirection, sunTime);

  function handleStageClick(event: { target: unknown; currentTarget: unknown }) {
    if (event.target !== event.currentTarget && editorMode !== 'create') {
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

    const gardenPoint = toGardenPoint(pointer, metrics);

    if (editorMode === 'plant') {
      onPlacePlant(gardenPoint);
      return;
    }

    if (editorMode === 'create') {
      onAddPoint(gardenPoint);
      return;
    }

    onSelectShape(null);
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

        {showSun ? (
          <SunPathOverlay
            konva={konva}
            metrics={metrics}
            sunDirection={sunDirection}
            visualization={sunVisualization}
            onSunTimeChange={onSunTimeChange}
          />
        ) : null}

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
              onMouseDown={(event: {
                cancelBubble: boolean;
                target: {
                  getStage: () => {
                    getPointerPosition: () => { x: number; y: number } | null;
                  } | null;
                };
              }) => {
                if (editorMode === 'create') {
                  return;
                }

                event.cancelBubble = true;

                if (editorMode === 'plant' && shape.type === 'plant_area') {
                  const pointer = event.target.getStage()?.getPointerPosition();

                  if (pointer) {
                    onPlacePlant(toGardenPoint(pointer, metrics));
                  }
                }

                if (editorMode === 'select') {
                  onSelectShape(shape.id);
                }
              }}
            />
          );
        })}

        {placedPlants.map((plant) => {
          const canvasPoint = toCanvasPoint(plant, metrics);
          const footprintSize = getPlantFootprintMeters(plant, metrics) * metrics.scale;
          const isSelected = plant.id === selectedPlacedPlantId;
          const receivesSun =
            showSun &&
            !isLightBlocked(
              toCanvasPoint(getPlantCenterPoint(plant, metrics), metrics),
              metrics,
              shapes,
              sunVisualization,
            );

          return (
            <Group
              key={plant.id}
              x={canvasPoint.x}
              y={canvasPoint.y}
              draggable={editorMode !== 'create'}
              dragBoundFunc={(position: { x: number; y: number }) =>
                toCanvasPoint(
                  clampPlantGardenPoint(toGardenPoint(position, metrics), metrics, plant.size),
                  metrics,
                )
              }
              onMouseDown={(event: { cancelBubble: boolean }) => {
                event.cancelBubble = true;
                onSelectPlacedPlant(plant.id);
              }}
              onDragStart={(event: { cancelBubble: boolean }) => {
                event.cancelBubble = true;
                onSelectPlacedPlant(plant.id);
              }}
              onDragEnd={(event: {
                target: {
                  x: (value?: number) => number;
                  y: (value?: number) => number;
                };
              }) => {
                const nextPoint = clampPlantGardenPoint(
                  toGardenPoint({ x: event.target.x(), y: event.target.y() }, metrics),
                  metrics,
                  plant.size,
                );
                const didMove = onMovePlant(plant.id, nextPoint);

                if (!didMove) {
                  event.target.x(canvasPoint.x);
                  event.target.y(canvasPoint.y);
                }
              }}
            >
              <Rect
                x={0}
                y={0}
                width={footprintSize}
                height={footprintSize}
                fill={receivesSun ? 'rgba(255, 173, 102, 0.28)' : 'rgba(143, 220, 102, 0.24)'}
                stroke={isSelected ? '#FFAD66' : receivesSun ? '#E97828' : '#26783A'}
                strokeWidth={isSelected ? 3 : 2}
                cornerRadius={3}
                shadowColor={receivesSun ? '#FFAD66' : undefined}
                shadowBlur={receivesSun ? 10 : 0}
                shadowOpacity={receivesSun ? 0.28 : 0}
              />
              <Circle
                x={footprintSize / 2}
                y={footprintSize / 2}
                radius={isSelected ? 8 : 6}
                fill={receivesSun ? '#FFAD66' : '#8FDC66'}
                stroke={isSelected ? '#F7F8F4' : '#182019'}
                strokeWidth={2}
              />
              {isSelected ? (
                <Text
                  x={footprintSize + 8}
                  y={Math.max(0, footprintSize / 2 - 9)}
                  text={`${plant.size}x${plant.size}`}
                  fontSize={12}
                  fontStyle="bold"
                  fill="#FFAD66"
                  listening={false}
                />
              ) : null}
            </Group>
          );
        })}

        {shapes
          .filter((shape) => editorMode === 'select' && shape.id === selectedShapeId)
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

function SunPathOverlay({
  konva,
  metrics,
  sunDirection,
  visualization,
  onSunTimeChange,
}: {
  konva: KonvaModule;
  metrics: EditorMetrics;
  sunDirection: Garden['sunDirection'];
  visualization: SunVisualization;
  onSunTimeChange: (time: number) => void;
}) {
  const { Circle, Line, Text } = konva;

  return (
    <>
      <Line
        points={visualization.pathPoints}
        stroke="#FFAD66"
        strokeWidth={2}
        opacity={0.72}
        dash={[8, 8]}
        listening={false}
      />
      <Circle
        x={visualization.sunX}
        y={visualization.sunY}
        radius={13}
        fill="#FFAD66"
        stroke="#F7F8F4"
        strokeWidth={2}
        shadowColor="#FFAD66"
        shadowBlur={18}
        shadowOpacity={0.55}
        draggable
        onMouseDown={(event: { cancelBubble: boolean }) => {
          event.cancelBubble = true;
        }}
        onDragStart={(event: { cancelBubble: boolean }) => {
          event.cancelBubble = true;
        }}
        dragBoundFunc={(position: { x: number; y: number }) => {
          const nextTime = getSunTimeFromCanvasPoint(metrics, sunDirection, position);
          const nextVisualization = getSunVisualization(metrics, sunDirection, nextTime);

          return {
            x: nextVisualization.sunX,
            y: nextVisualization.sunY,
          };
        }}
        onDragMove={(event: { target: { x: () => number; y: () => number } }) => {
          onSunTimeChange(
            getSunTimeFromCanvasPoint(metrics, sunDirection, {
              x: event.target.x(),
              y: event.target.y(),
            }),
          );
        }}
        onDragEnd={(event: { target: { x: () => number; y: () => number } }) => {
          onSunTimeChange(
            getSunTimeFromCanvasPoint(metrics, sunDirection, {
              x: event.target.x(),
              y: event.target.y(),
            }),
          );
        }}
      />
      <Line
        points={[
          visualization.sunX,
          visualization.sunY,
          visualization.gardenCenterX,
          visualization.gardenCenterY,
        ]}
        stroke="#FFAD66"
        strokeWidth={1}
        opacity={0.38}
        dash={[4, 8]}
        listening={false}
      />
      <Text
        x={visualization.sunX + 18}
        y={visualization.sunY - 8}
        text={visualization.timeLabel}
        fontSize={12}
        fontStyle="bold"
        fill="#FFAD66"
        listening={false}
      />
    </>
  );
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

type SunVisualization = {
  pathPoints: number[];
  sunX: number;
  sunY: number;
  gardenCenterX: number;
  gardenCenterY: number;
  timeLabel: string;
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

function getDefaultActionsPanelPosition(
  canvasSize: CanvasSize,
  panel: HTMLDivElement | null,
): PanelPosition {
  return {
    x: Math.max(16, canvasSize.width - (panel?.offsetWidth ?? 384) - 16),
    y: 16,
  };
}

function clampPanelPosition(
  position: PanelPosition,
  canvasSize: CanvasSize,
  panel: HTMLDivElement | null,
): PanelPosition {
  const maxX = Math.max(16, canvasSize.width - (panel?.offsetWidth ?? 384) - 16);
  const maxY = Math.max(16, canvasSize.height - (panel?.offsetHeight ?? 320) - 16);

  return {
    x: clamp(position.x, 16, maxX),
    y: clamp(position.y, 16, maxY),
  };
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

function getPlantLibraryEntry(plantLibrary: PlantLibraryEntry[], plantLibraryId: number) {
  return plantLibrary.find((plant) => plant.plantLibraryId === plantLibraryId) ?? null;
}

function getPlantFootprintMeters(plant: Pick<PlacedPlant, 'size'>, metrics: EditorMetrics) {
  return plant.size * metrics.gridStepMeters;
}

function clampPlantGardenPoint(
  point: GardenPoint,
  metrics: EditorMetrics,
  plantSize: PlantSize,
): GardenPoint {
  const footprintMeters = plantSize * metrics.gridStepMeters;

  return {
    x: Math.max(0, Math.min(metrics.widthMeters - footprintMeters, Math.max(0, point.x))),
    y: Math.max(0, Math.min(metrics.heightMeters - footprintMeters, Math.max(0, point.y))),
  };
}

function isPlantPlacementInsideGarden(plant: PlacedPlant, metrics: EditorMetrics) {
  const footprintMeters = getPlantFootprintMeters(plant, metrics);

  return (
    plant.x >= 0 &&
    plant.y >= 0 &&
    plant.x + footprintMeters <= metrics.widthMeters + 0.0001 &&
    plant.y + footprintMeters <= metrics.heightMeters + 0.0001
  );
}

function isPlantFootprintInsidePlantArea(
  plant: PlacedPlant,
  shapes: GardenEditorShape[],
  metrics: EditorMetrics,
) {
  const samplePoints = getPlantFootprintSamplePoints(plant, metrics);
  const plantAreas = shapes.filter((shape) => shape.type === 'plant_area');

  return plantAreas.some((plantArea) =>
    samplePoints.every((point) => isPointInPolygon(point, plantArea.points)),
  );
}

function getPlantFootprintSamplePoints(plant: PlacedPlant, metrics: EditorMetrics) {
  return Array.from({ length: plant.size }).flatMap((_, columnIndex) =>
    Array.from({ length: plant.size }).map((__, rowIndex) => ({
      x: plant.x + columnIndex * metrics.gridStepMeters + metrics.gridStepMeters / 2,
      y: plant.y + rowIndex * metrics.gridStepMeters + metrics.gridStepMeters / 2,
    })),
  );
}

function doesPlantFootprintOverlap(
  plant: PlacedPlant,
  placedPlants: PlacedPlant[],
  metrics: EditorMetrics,
  ignoredPlantId?: string,
) {
  return placedPlants.some((placedPlant) => {
    if (placedPlant.id === ignoredPlantId) {
      return false;
    }

    return doPlantFootprintsOverlap(plant, placedPlant, metrics);
  });
}

function doPlantFootprintsOverlap(
  plant: PlacedPlant,
  otherPlant: PlacedPlant,
  metrics: EditorMetrics,
) {
  const plantSizeMeters = getPlantFootprintMeters(plant, metrics);
  const otherPlantSizeMeters = getPlantFootprintMeters(otherPlant, metrics);

  return (
    plant.x < otherPlant.x + otherPlantSizeMeters - 0.0001 &&
    plant.x + plantSizeMeters > otherPlant.x + 0.0001 &&
    plant.y < otherPlant.y + otherPlantSizeMeters - 0.0001 &&
    plant.y + plantSizeMeters > otherPlant.y + 0.0001
  );
}

function getPlantCenterPoint(plant: PlacedPlant, metrics: EditorMetrics): GardenPoint {
  const halfFootprintMeters = getPlantFootprintMeters(plant, metrics) / 2;

  return {
    x: plant.x + halfFootprintMeters,
    y: plant.y + halfFootprintMeters,
  };
}

function getPlacedPlantName(plant: PlacedPlant, plantLibrary: PlantLibraryEntry[]) {
  return getPlantLibraryEntry(plantLibrary, plant.plantLibraryId)?.commonName ?? 'Plant';
}

function formatPoint(point: GardenPoint) {
  return `${formatSize(point.x)} m x ${formatSize(point.y)} m`;
}

function isLightBlocked(
  canvasPoint: { x: number; y: number },
  metrics: EditorMetrics,
  shapes: GardenEditorShape[],
  sunVisualization: SunVisualization,
) {
  return Boolean(getFirstLightBlockPoint(canvasPoint, metrics, shapes, sunVisualization));
}

function getFirstLightBlockPoint(
  canvasPoint: { x: number; y: number },
  metrics: EditorMetrics,
  shapes: GardenEditorShape[],
  sunVisualization: SunVisualization,
) {
  const blockingBuildings = shapes.filter((shape) => shape.type === 'blocking_building');
  const sunPoint = { x: sunVisualization.sunX, y: sunVisualization.sunY };
  let closestBlockPoint: { x: number; y: number } | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const building of blockingBuildings) {
    const canvasPolygon = building.points.map((point) => toCanvasPoint(point, metrics));

    for (let index = 0; index < canvasPolygon.length; index += 1) {
      const start = canvasPolygon[index];
      const end = canvasPolygon[(index + 1) % canvasPolygon.length];
      const intersection = getSegmentIntersection(sunPoint, canvasPoint, start, end);

      if (!intersection) {
        continue;
      }

      const distance = Math.hypot(intersection.x - sunPoint.x, intersection.y - sunPoint.y);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestBlockPoint = intersection;
      }
    }
  }

  return closestBlockPoint;
}

function isPointInPolygon(point: GardenPoint, polygon: GardenPoint[]) {
  let isInside = false;

  for (
    let index = 0, previousIndex = polygon.length - 1;
    index < polygon.length;
    previousIndex = index++
  ) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previousIndex];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (intersects) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function getSegmentIntersection(
  firstStart: { x: number; y: number },
  firstEnd: { x: number; y: number },
  secondStart: { x: number; y: number },
  secondEnd: { x: number; y: number },
) {
  const firstDeltaX = firstEnd.x - firstStart.x;
  const firstDeltaY = firstEnd.y - firstStart.y;
  const secondDeltaX = secondEnd.x - secondStart.x;
  const secondDeltaY = secondEnd.y - secondStart.y;
  const denominator = firstDeltaX * secondDeltaY - firstDeltaY * secondDeltaX;

  if (Math.abs(denominator) < 0.0001) {
    return null;
  }

  const relativeX = secondStart.x - firstStart.x;
  const relativeY = secondStart.y - firstStart.y;
  const firstScale = (relativeX * secondDeltaY - relativeY * secondDeltaX) / denominator;
  const secondScale = (relativeX * firstDeltaY - relativeY * firstDeltaX) / denominator;

  if (firstScale < 0 || firstScale > 1 || secondScale < 0 || secondScale > 1) {
    return null;
  }

  return {
    x: firstStart.x + firstScale * firstDeltaX,
    y: firstStart.y + firstScale * firstDeltaY,
  };
}

function getSunVisualization(
  metrics: EditorMetrics,
  sunDirection: Garden['sunDirection'],
  sunTime: number,
): SunVisualization {
  const gardenCenterX = metrics.originX + metrics.gardenWidthPx / 2;
  const gardenCenterY = metrics.originY + metrics.gardenHeightPx / 2;
  const progress = clamp((sunTime - 6) / 12, 0, 1);
  const noonAngle = getDirectionAngle(sunDirection);
  const sweep = (140 * Math.PI) / 180;
  const startAngle = noonAngle - sweep / 2;
  const angle = startAngle + sweep * progress;
  const radiusX = Math.max(
    32,
    Math.min(
      metrics.gardenWidthPx / 2 + 42,
      gardenCenterX - 18,
      metrics.canvasWidth - gardenCenterX - 18,
    ),
  );
  const radiusY = Math.max(
    32,
    Math.min(
      metrics.gardenHeightPx / 2 + 42,
      gardenCenterY - 18,
      metrics.canvasHeight - gardenCenterY - 18,
    ),
  );

  const pathPoints = Array.from({ length: 36 }, (_, index) => {
    const pathProgress = index / 35;
    const pathAngle = startAngle + sweep * pathProgress;

    return [
      gardenCenterX + Math.cos(pathAngle) * radiusX,
      gardenCenterY + Math.sin(pathAngle) * radiusY,
    ];
  }).flat();

  const sunX = gardenCenterX + Math.cos(angle) * radiusX;
  const sunY = gardenCenterY + Math.sin(angle) * radiusY;

  return {
    pathPoints,
    sunX,
    sunY,
    gardenCenterX,
    gardenCenterY,
    timeLabel: formatSunTime(sunTime),
  };
}

function getSunTimeFromCanvasPoint(
  metrics: EditorMetrics,
  sunDirection: Garden['sunDirection'],
  point: { x: number; y: number },
) {
  const gardenCenterX = metrics.originX + metrics.gardenWidthPx / 2;
  const gardenCenterY = metrics.originY + metrics.gardenHeightPx / 2;
  const noonAngle = getDirectionAngle(sunDirection);
  const sweep = (140 * Math.PI) / 180;
  const startAngle = noonAngle - sweep / 2;
  const radiusX = Math.max(
    32,
    Math.min(
      metrics.gardenWidthPx / 2 + 42,
      gardenCenterX - 18,
      metrics.canvasWidth - gardenCenterX - 18,
    ),
  );
  const radiusY = Math.max(
    32,
    Math.min(
      metrics.gardenHeightPx / 2 + 42,
      gardenCenterY - 18,
      metrics.canvasHeight - gardenCenterY - 18,
    ),
  );
  const rawAngle = Math.atan2(
    (point.y - gardenCenterY) / radiusY,
    (point.x - gardenCenterX) / radiusX,
  );
  const angle = normalizeAngleAfterStart(rawAngle, startAngle);
  const progress = clamp((angle - startAngle) / sweep, 0, 1);

  return Math.round((6 + progress * 12) * 2) / 2;
}

function normalizeAngleAfterStart(angle: number, startAngle: number) {
  let normalizedAngle = angle;

  while (normalizedAngle < startAngle) {
    normalizedAngle += Math.PI * 2;
  }

  while (normalizedAngle > startAngle + Math.PI * 2) {
    normalizedAngle -= Math.PI * 2;
  }

  return normalizedAngle;
}

function getDirectionAngle(direction: Garden['sunDirection']) {
  switch (direction) {
    case 'north':
      return -Math.PI / 2;
    case 'east':
      return 0;
    case 'south':
      return Math.PI / 2;
    case 'west':
      return Math.PI;
    default:
      return Math.PI / 2;
  }
}

function getDirectionLabel(direction: Garden['sunDirection']) {
  return `${direction[0].toUpperCase()}${direction.slice(1)}`;
}

function formatSunTime(value: number) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
