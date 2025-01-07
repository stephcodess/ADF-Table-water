import { Text } from "@chakra-ui/react";
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode; // The children components to be wrapped by the error boundary
}

interface ErrorBoundaryState {
  hasError: boolean; // A state flag indicating whether an error has occurred
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false }; // Initialize with no error
  }

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    // Update the state to indicate an error occurred
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    // Log the error to an external service or console for debugging
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Text>{"Something went wrong. Please try again later."}</Text>;
    }

    return this.props.children; // Render the children if there's no error
  }
}

export default ErrorBoundary;
