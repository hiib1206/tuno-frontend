interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={`text-center space-y-4 ${className || ""}`}>
      <h1 className="text-4xl font-bold text-foreground leading-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-base whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
