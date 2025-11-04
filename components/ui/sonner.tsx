// TODO: Install next-themes package for theme support
// import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // const { theme = "system" } = useTheme();
  const theme = "system"; // Fallback when next-themes is not available

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-foreground group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "!bg-red-50 !border-red-200 !text-red-900 [&_[data-description]]:!text-red-800",
          success:
            "!bg-green-50 !border-green-200 !text-green-900 [&_[data-description]]:!text-green-800",
          warning:
            "!bg-yellow-50 !border-yellow-200 !text-yellow-900 [&_[data-description]]:!text-yellow-800",
          info:
            "!bg-blue-50 !border-blue-200 !text-blue-900 [&_[data-description]]:!text-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
