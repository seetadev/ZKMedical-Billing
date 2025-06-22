  // In your home.tsx
// AUTOSAVE HANDLER
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  useEffect(() => {
    const handleAutoSave = () => {
      console.log("Auto-saving file...");
      if (selectedFile === "default") {
        return;
      }
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const data = store._getFile(selectedFile);
      const file = new File(
        (data as any)?.created || new Date().toString(),
        new Date().toString(),
        content,
        selectedFile,
        billType
      );
      store._saveFile(file);
      updateSelectedFile(selectedFile);
    };

    const debouncedAutoSave = () => {
      if (autoSaveTimer) {
        console.log("Clearing previous autosave timer");
        clearTimeout(autoSaveTimer);
      }
      const newTimer = setTimeout(() => {
        console.log("Executing final autosave after debounce");
        handleAutoSave();
        setAutoSaveTimer(null);
      }, 2000);

      setAutoSaveTimer(newTimer);
    };

    const removeListener = AppGeneral.addKeydownListener((eventData) => {
      // console.log(
      //   "Key pressed:",
      //   eventData.key,
      //   "- triggering debounced autosave"
      // );
      debouncedAutoSave();
    });
    return () => {
      removeListener();
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [selectedFile, billType, autoSaveTimer]); 