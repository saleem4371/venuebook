// utils/amenityMapper.ts

export const mapAmenities = (groups: any[], AMENITY_META: any) => {
  return (groups || []).map((group) => ({
    ...group,

    children: (group.children || []).map((item: any) => {
      const meta = AMENITY_META[item.name] || {};

      return {
        ...item,
        icon: meta.icon || 'Check',
        color: meta.color || '',
      };
    }),
  }));
};