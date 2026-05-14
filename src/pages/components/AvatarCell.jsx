export default function AvatarCell({ image, name, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">
            {name?.[0]}
          </span>
        )}
      </div>

      <div>
        <p className="font-medium">{name}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
