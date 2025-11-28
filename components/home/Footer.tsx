export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-bold mb-2">Prophet AI</h4>
          <p className="text-muted-foreground text-sm">
            © 2024 Prophet AI Inc. All rights reserved.
          </p>
        </div>

        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
