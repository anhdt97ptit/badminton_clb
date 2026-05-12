'use client';

import * as React from 'react';

import { AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, Loader, XIcon } from 'lucide-react';
import { Button } from '../button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { cn } from '@/lib/utils';
import { AnimateGenericFadeInOut } from '@/components/ui/shared/animate-generic-fade-in-out';

type OptionValue = string | number | boolean | null;

type ComboBoxOption<T = OptionValue> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type SingleSelectComboboxProps<T = OptionValue> = {
  emptySelectionPlaceholder?: React.ReactNode | string;
  enableClearAllButton?: boolean;
  loading?: boolean;
  loadingSearch?: boolean;
  inputPlaceholder?: string;
  onChange: (_value: T) => void;
  onChangeSearch?: (_value: string) => void;
  options: ComboBoxOption<T>[];
  selectedValue: T;
};

/**
 * Single select combo box component which supports:
 *
 * - Label/value pairs
 * - Loading state
 * - Clear all button
 */
export function SingleSelectCombobox<T = OptionValue>({
  emptySelectionPlaceholder = 'Select value...',
  enableClearAllButton,
  inputPlaceholder,
  onChange,
  onChangeSearch,
  loadingSearch,
  loading,
  options,
  selectedValue,
}: SingleSelectComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedOption: T) => {
    onChange(selectedOption);

    setOpen(false);
  };

  const selectedOption = React.useMemo(() => {
    return options.find((value) => {
      return value.value === selectedValue;
    });
  }, [selectedValue, options]);

  const buttonLabel = React.useMemo(() => {
    if (loading) {
      return '';
    }

    if (!selectedOption) {
      return emptySelectionPlaceholder;
    }

    return selectedOption.label;
  }, [selectedOption, emptySelectionPlaceholder, loading]);

  const showClearButton = enableClearAllButton && !!selectedValue;

  return (
    <Popover open={open && !loading} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={loading}
            aria-expanded={open}
            className="h-10 w-full min-w-50 bg-white px-3 dark:bg-transparent hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
          >
            <AnimatePresence>
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-100" />
                </div>
              ) : (
                <AnimateGenericFadeInOut className="flex w-full justify-between">
                  <span
                    className={cn('truncate', {
                      'text-muted-foreground': !selectedOption,
                    })}
                  >
                    {buttonLabel}
                  </span>

                  <div
                    className={cn('ml-2 flex flex-row items-center', {
                      'ml-6': showClearButton,
                    })}
                  >
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </AnimateGenericFadeInOut>
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>

        {/* This is placed outside the trigger since we can't have nested buttons. */}
        {showClearButton && !loading && (
          <div className="absolute bottom-0 right-8 top-0 flex items-center justify-center">
            <button
              className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 dark:bg-neutral-700"
              onClick={() => {
                (onChange as (v: OptionValue) => void)(null);
                onChangeSearch && onChangeSearch('');
              }}
            >
              <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      <PopoverContent className="scrollbar max-h-72 w-fit min-w-50 overflow-auto p-0">
        <Command shouldFilter={!onChangeSearch}>
          <CommandInput onValueChange={onChangeSearch} placeholder={inputPlaceholder} />
          {loadingSearch && (
            <div className="my-2 flex items-center justify-center">
              <Loader className={'mr-2 animate-spin'} />
            </div>
          )}
          <CommandList>
            <CommandEmpty>No value found.</CommandEmpty>
            <CommandGroup>
              {options.map((option, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-1 h-4 w-4',
                      selectedValue === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
