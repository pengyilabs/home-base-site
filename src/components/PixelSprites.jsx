// Tiny inline pixel-art sprites inspired by Fields of Mistria's cozy farm aesthetic.
// Pure SVG with shape-rendering: crispEdges so they scale without anti-aliasing.

function PixelFlower({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="8" width="2" height="7" fill="#6a9c5a" />
      <rect x="5" y="10" width="2" height="2" fill="#6a9c5a" />
      <rect x="9" y="11" width="2" height="2" fill="#6a9c5a" />
      <rect x="7" y="5" width="2" height="3" fill="#e87da0" />
      <rect x="5" y="3" width="2" height="3" fill="#e87da0" />
      <rect x="9" y="3" width="2" height="3" fill="#e87da0" />
      <rect x="3" y="5" width="3" height="2" fill="#e87da0" />
      <rect x="10" y="5" width="3" height="2" fill="#e87da0" />
      <rect x="7" y="2" width="2" height="3" fill="#e87da0" />
      <rect x="7" y="6" width="2" height="2" fill="#f5c842" />
    </svg>
  );
}

function PixelMushroom({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="2" width="8" height="2" fill="#c25e5e" />
      <rect x="3" y="4" width="10" height="3" fill="#c25e5e" />
      <rect x="2" y="7" width="12" height="1" fill="#c25e5e" />
      <rect x="5" y="3" width="2" height="2" fill="#f7eeda" />
      <rect x="9" y="5" width="2" height="2" fill="#f7eeda" />
      <rect x="4" y="8" width="8" height="1" fill="#d4a574" />
      <rect x="5" y="9" width="6" height="5" fill="#d4a574" />
      <rect x="6" y="14" width="4" height="1" fill="#c89b6a" />
    </svg>
  );
}

function PixelTree({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="12" width="2" height="3" fill="#8b6b52" />
      <rect x="6" y="15" width="4" height="1" fill="#8b6b52" />
      <rect x="6" y="2" width="4" height="2" fill="#6a9c5a" />
      <rect x="4" y="4" width="8" height="2" fill="#6a9c5a" />
      <rect x="3" y="6" width="10" height="3" fill="#6a9c5a" />
      <rect x="4" y="9" width="8" height="2" fill="#6a9c5a" />
      <rect x="5" y="11" width="6" height="1" fill="#6a9c5a" />
      <rect x="5" y="5" width="2" height="2" fill="#7ab86a" />
      <rect x="9" y="7" width="2" height="2" fill="#7ab86a" />
    </svg>
  );
}

function PixelStar({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="1" width="2" height="3" fill="#f5c842" />
      <rect x="7" y="5" width="2" height="2" fill="#f5c842" />
      <rect x="1" y="7" width="3" height="2" fill="#f5c842" />
      <rect x="5" y="7" width="2" height="2" fill="#f5c842" />
      <rect x="9" y="7" width="2" height="2" fill="#f5c842" />
      <rect x="12" y="7" width="3" height="2" fill="#f5c842" />
      <rect x="7" y="9" width="2" height="2" fill="#f5c842" />
      <rect x="7" y="11" width="2" height="3" fill="#f5c842" />
      <rect x="7" y="7" width="2" height="2" fill="#f7eeda" />
    </svg>
  );
}

function PixelHouse({ className = "sprite sprite-md" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="6" y="1" width="4" height="2" fill="#8b6b52" />
      <rect x="5" y="3" width="6" height="1" fill="#c25e5e" />
      <rect x="4" y="4" width="8" height="1" fill="#c25e5e" />
      <rect x="3" y="5" width="10" height="1" fill="#c25e5e" />
      <rect x="2" y="6" width="12" height="1" fill="#c25e5e" />
      <rect x="1" y="7" width="14" height="1" fill="#c25e5e" />
      <rect x="3" y="8" width="10" height="6" fill="#d4a574" />
      <rect x="7" y="10" width="3" height="4" fill="#8b6b52" />
      <rect x="4" y="9" width="2" height="2" fill="#6888b0" />
      <rect x="11" y="9" width="2" height="2" fill="#6888b0" />
      <rect x="3" y="14" width="10" height="1" fill="#8b6b52" />
    </svg>
  );
}

function PixelHeart({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="3" y="3" width="3" height="2" fill="#e87da0" />
      <rect x="10" y="3" width="3" height="2" fill="#e87da0" />
      <rect x="2" y="5" width="5" height="2" fill="#e87da0" />
      <rect x="9" y="5" width="5" height="2" fill="#e87da0" />
      <rect x="2" y="7" width="12" height="2" fill="#e87da0" />
      <rect x="3" y="9" width="10" height="2" fill="#e87da0" />
      <rect x="4" y="11" width="8" height="1" fill="#e87da0" />
      <rect x="5" y="12" width="6" height="1" fill="#e87da0" />
      <rect x="7" y="13" width="2" height="1" fill="#e87da0" />
      <rect x="4" y="5" width="2" height="2" fill="#f2a0b8" />
    </svg>
  );
}

function PixelWheat({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="3" width="2" height="12" fill="#c8963a" />
      <rect x="5" y="4" width="2" height="2" fill="#c8963a" />
      <rect x="9" y="4" width="2" height="2" fill="#c8963a" />
      <rect x="5" y="7" width="2" height="2" fill="#c8963a" />
      <rect x="9" y="7" width="2" height="2" fill="#c8963a" />
      <rect x="5" y="10" width="2" height="2" fill="#c8963a" />
      <rect x="9" y="10" width="2" height="2" fill="#c8963a" />
      <rect x="4" y="5" width="1" height="1" fill="#d4a574" />
      <rect x="11" y="5" width="1" height="1" fill="#d4a574" />
      <rect x="4" y="8" width="1" height="1" fill="#d4a574" />
      <rect x="11" y="8" width="1" height="1" fill="#d4a574" />
    </svg>
  );
}

function PixelLeaf({ className = "sprite sprite-sm" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="8" y="2" width="2" height="2" fill="#6a9c5a" />
      <rect x="6" y="4" width="4" height="2" fill="#6a9c5a" />
      <rect x="5" y="6" width="6" height="2" fill="#7ab86a" />
      <rect x="4" y="8" width="8" height="2" fill="#7ab86a" />
      <rect x="5" y="10" width="6" height="2" fill="#6a9c5a" />
      <rect x="6" y="12" width="4" height="2" fill="#6a9c5a" />
      <rect x="7" y="4" width="1" height="8" fill="#5a8c4a" />
      <rect x="9" y="6" width="1" height="6" fill="#5a8c4a" />
    </svg>
  );
}

export { PixelFlower, PixelMushroom, PixelTree, PixelStar, PixelHouse, PixelHeart, PixelWheat, PixelLeaf };
