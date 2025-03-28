import { useState, useCallback } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useDebounce } from 'minimal-shared/hooks';

import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link, { linkClasses } from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useSearchEvents } from 'src/hooks/use-event';

import { Iconify } from 'src/components/iconify';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function EventSearch({ redirectPath, sx }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500); // 500ms debounce
  const { searchResults: options, searchLoading: loading } = useSearchEvents(debouncedQuery);

  const handleChange = useCallback(
    (item) => {
      setSelectedItem(item);
      if (item) {
        router.push(redirectPath(item.id));
      }
    },
    [redirectPath, router]
  );

  const handleInputChange = useCallback((event, newValue) => {
    setSearchQuery(newValue);
    if (newValue && newValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  const paperStyles = {
    width: 320,
    [` .${autocompleteClasses.listbox}`]: {
      [` .${autocompleteClasses.option}`]: {
        p: 0,
        [` .${linkClasses.root}`]: {
          p: 0.75,
          gap: 1.5,
          width: 1,
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  };

  return (
    <Autocomplete
      autoHighlight
      popupIcon={null}
      loading={loading}
      options={options}
      open={open && debouncedQuery.length >= 2}
      onOpen={() => {
        if (debouncedQuery.length >= 2) setOpen(true);
      }}
      onClose={() => setOpen(false)}
      value={selectedItem}
      onChange={(event, newValue) => handleChange(newValue)}
      onInputChange={handleInputChange}
      getOptionLabel={(option) => option.title || ''}
      noOptionsText={
        debouncedQuery.length < 2 ? (
          <Typography variant="body2" sx={{ p: 1 }}>
            Please enter at least 2 characters to search
          </Typography>
        ) : (
          <SearchNotFound query={debouncedQuery} />
        )
      }
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      slotProps={{ paper: { sx: paperStyles } }}
      sx={[{ width: { xs: 1, sm: 260 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search events..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <Iconify icon="svg-spinners:8-dots-rotate" sx={{ mr: -3 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, event, { inputValue }) => {
        const matches = match(event.title, inputValue);
        const parts = parse(event.title, matches);

        return (
          <li {...props} key={event.id}>
            <Link
              component={RouterLink}
              href={redirectPath(event.id)}
              color="inherit"
              underline="none"
            >
              <Avatar
                key={event.id}
                alt={event.title}
                src={event.coverUrl}
                variant="rounded"
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 1,
                }}
              />

              <div key={inputValue}>
                {parts.map((part, index) => (
                  <Typography
                    key={index}
                    component="span"
                    color={part.highlight ? 'primary' : 'textPrimary'}
                    sx={{
                      typography: 'body2',
                      fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                    }}
                  >
                    {part.text}
                  </Typography>
                ))}
              </div>
            </Link>
          </li>
        );
      }}
    />
  );
}
